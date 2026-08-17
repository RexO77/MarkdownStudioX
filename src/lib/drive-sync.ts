import type { Document } from '@/hooks/useDocuments';
import { sanitizeName, uniqueFilename } from '@/lib/sync-folder';

/**
 * Google Drive sync: documents mirror as .md files in a "Markdown Studio X"
 * folder in the user's Drive. Entirely client-side — Google Identity
 * Services issues the token in the browser; there is no backend and no
 * stored secret. The drive.file scope only grants access to files this app
 * created, which keeps the OAuth consent in Google's non-sensitive tier.
 *
 * Same reconciliation philosophy as the folder sync (last-writer-wins,
 * localStorage owns document existence), with one upgrade: Drive file ids
 * are stable, so external renames sync instead of duplicating.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'Markdown Studio X';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

const STATE_KEY = 'markdown-studio-drive-state';
const TOKEN_KEY = 'markdown-studio-drive-token';
const CONNECTED_KEY = 'markdown-studio-drive-connected';

/** Drive modifiedTime is second-precision in practice; allow drift. */
const MTIME_SLACK_MS = 2000;

export const isDriveSyncConfigured = (): boolean => Boolean(CLIENT_ID);

/** Thrown when a token can't be obtained without user interaction. */
export class DriveAuthRequiredError extends Error {
  constructor(message = 'Google sign-in required') {
    super(message);
    this.name = 'DriveAuthRequiredError';
  }
}

// ---------------------------------------------------------------------------
// Auth: GIS token client, loaded on demand

interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

let gisLoading: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisLoading) {
    gisLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisLoading = null;
        reject(new Error('Could not load Google sign-in'));
      };
      document.head.appendChild(script);
    });
  }
  return gisLoading;
}

function storedToken(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const token = JSON.parse(raw) as StoredToken;
    return token.expiresAt > Date.now() + 60_000 ? token : null;
  } catch {
    return null;
  }
}

export const wasDriveConnected = (): boolean => localStorage.getItem(CONNECTED_KEY) === '1';

/**
 * Get an access token. `interactive: false` tries a silent grant (works when
 * the user has an active Google session and consented before) and throws
 * DriveAuthRequiredError otherwise; `interactive: true` may open the Google
 * popup and must be called from a user gesture.
 */
export async function getAccessToken(interactive: boolean): Promise<string> {
  if (!CLIENT_ID) throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');
  const cached = storedToken();
  if (cached) return cached.accessToken;

  await loadGis();
  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            interactive
              ? new Error(response.error_description || response.error || 'Sign-in failed')
              : new DriveAuthRequiredError()
          );
          return;
        }
        const token: StoredToken = {
          accessToken: response.access_token,
          expiresAt: Date.now() + Number(response.expires_in ?? 3600) * 1000,
        };
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
        localStorage.setItem(CONNECTED_KEY, '1');
        resolve(token.accessToken);
      },
      error_callback: () => {
        reject(interactive ? new Error('Sign-in was closed') : new DriveAuthRequiredError());
      },
    });
    client.requestAccessToken({ prompt: interactive && !wasDriveConnected() ? 'consent' : '' });
  });
}

export async function signOutDrive(): Promise<void> {
  const token = storedToken();
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CONNECTED_KEY);
  localStorage.removeItem(STATE_KEY);
  if (token) {
    try {
      await loadGis();
      window.google!.accounts.oauth2.revoke(token.accessToken, () => {});
    } catch {
      // Revocation is best-effort; the token expires within the hour anyway.
    }
  }
}

// ---------------------------------------------------------------------------
// Drive REST helpers

async function drive<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (res.status === 401) throw new DriveAuthRequiredError('Google session expired');
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (res.headers.get('content-type') ?? '').includes('application/json')
    ? res.json()
    : (res.text() as unknown as Promise<T>);
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

const qEscape = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

async function ensureFolder(token: string): Promise<string> {
  const state = loadState();
  if (state.folderId) {
    // Trust but verify — the user may have trashed the folder.
    try {
      const meta = await drive<{ trashed: boolean }>(token, `/files/${state.folderId}?fields=trashed`);
      if (!meta.trashed) return state.folderId;
    } catch {
      // Fall through and search or recreate.
    }
  }
  const search = await drive<{ files: DriveFile[] }>(
    token,
    `/files?q=${encodeURIComponent(`name='${qEscape(FOLDER_NAME)}' and mimeType='${FOLDER_MIME}' and trashed=false`)}&fields=files(id,name)`
  );
  let folderId = search.files[0]?.id;
  if (!folderId) {
    const created = await drive<DriveFile>(token, '/files?fields=id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
    });
    folderId = created.id;
  }
  state.folderId = folderId;
  saveState(state);
  return folderId;
}

async function listRemoteFiles(token: string, folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const page = await drive<{ files: DriveFile[]; nextPageToken?: string }>(
      token,
      `/files?q=${encodeURIComponent(`'${folderId}' in parents and trashed=false`)}` +
        `&fields=${encodeURIComponent('nextPageToken,files(id,name,modifiedTime)')}` +
        `&pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ''}`
    );
    files.push(...page.files);
    pageToken = page.nextPageToken;
  } while (pageToken);
  return files.filter((f) => f.name.toLowerCase().endsWith('.md'));
}

async function createRemoteFile(
  token: string,
  folderId: string,
  name: string,
  content: string
): Promise<DriveFile> {
  const boundary = `msx${Date.now().toString(36)}`;
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify({ name, parents: [folderId], mimeType: 'text/markdown' }) +
    `\r\n--${boundary}\r\nContent-Type: text/markdown; charset=UTF-8\r\n\r\n` +
    content +
    `\r\n--${boundary}--`;
  return drive<DriveFile>(
    token,
    `${UPLOAD_API}/files?uploadType=multipart&fields=id,name,modifiedTime`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  );
}

async function updateRemoteContent(token: string, fileId: string, content: string): Promise<DriveFile> {
  return drive<DriveFile>(
    token,
    `${UPLOAD_API}/files/${fileId}?uploadType=media&fields=id,name,modifiedTime`,
    { method: 'PATCH', headers: { 'Content-Type': 'text/markdown; charset=UTF-8' }, body: content }
  );
}

async function renameRemoteFile(token: string, fileId: string, name: string): Promise<DriveFile> {
  return drive<DriveFile>(token, `/files/${fileId}?fields=id,name,modifiedTime`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

async function trashRemoteFile(token: string, fileId: string): Promise<void> {
  await drive(token, `/files/${fileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true }),
  });
}

const downloadRemoteContent = (token: string, fileId: string): Promise<string> =>
  drive<string>(token, `/files/${fileId}?alt=media`);

// ---------------------------------------------------------------------------
// Sync state

interface DriveEntry {
  fileId: string;
  filename: string;
  syncedAt: number;
  remoteMtime: number;
}

interface DriveState {
  folderId?: string;
  entries: Record<string, DriveEntry>;
}

function loadState(): DriveState {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}');
    return { folderId: parsed.folderId, entries: parsed.entries ?? {} };
  } catch {
    return { entries: {} };
  }
}

function saveState(state: DriveState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

const generateId = (): string =>
  `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// ---------------------------------------------------------------------------
// The sync pass

export interface DriveSyncOutcome {
  updated: Document[];
  imported: Document[];
  filesWritten: number;
  filesDeleted: number;
}

export async function syncWithDrive(token: string, documents: Document[]): Promise<DriveSyncOutcome> {
  const folderId = await ensureFolder(token);
  const state = loadState();
  const remote = new Map((await listRemoteFiles(token, folderId)).map((f) => [f.id, f]));
  const outcome: DriveSyncOutcome = { updated: [], imported: [], filesWritten: 0, filesDeleted: 0 };
  const now = Date.now();

  // 1. Documents deleted in the app → trash their Drive files.
  const docIds = new Set(documents.map((d) => d.id));
  for (const [id, entry] of Object.entries(state.entries)) {
    if (docIds.has(id)) continue;
    if (remote.has(entry.fileId)) {
      try {
        await trashRemoteFile(token, entry.fileId);
        remote.delete(entry.fileId);
        outcome.filesDeleted += 1;
        delete state.entries[id];
        saveState(state);
      } catch (err) {
        if (err instanceof DriveAuthRequiredError) throw err;
        // File still in Drive — keep the mapping so import doesn't resurrect it.
      }
    } else {
      delete state.entries[id];
      saveState(state);
    }
  }

  const takenNames = new Set<string>();
  for (const entry of Object.values(state.entries)) takenNames.add(entry.filename.toLowerCase());
  for (const file of remote.values()) takenNames.add(file.name.toLowerCase());

  // 2. Reconcile each document with its Drive file.
  for (const doc of documents) {
    const entry = state.entries[doc.id];
    const file = entry ? remote.get(entry.fileId) : undefined;

    if (entry && file) {
      const remoteMtime = Date.parse(file.modifiedTime);
      const docChanged = doc.updatedAt > entry.syncedAt;
      const remoteChanged = remoteMtime > entry.remoteMtime + MTIME_SLACK_MS;

      if (remoteChanged && (!docChanged || remoteMtime >= doc.updatedAt)) {
        // Remote wins: pull content, and adopt a remote rename since Drive
        // ids make it unambiguous.
        const content = await downloadRemoteContent(token, entry.fileId);
        const remoteName = file.name.replace(/\.md$/i, '');
        if (content !== doc.content || remoteName !== doc.name) {
          outcome.updated.push({ ...doc, content, name: remoteName, updatedAt: remoteMtime });
        }
        entry.filename = file.name;
        entry.remoteMtime = remoteMtime;
        entry.syncedAt = now;
        saveState(state);
        continue;
      }

      // App wins (or nothing changed): rename first, then content.
      const desired = uniqueFilename(
        sanitizeName(doc.name),
        new Set([...takenNames].filter((n) => n !== entry.filename.toLowerCase()))
      );
      if (desired !== entry.filename) {
        const renamed = await renameRemoteFile(token, entry.fileId, desired);
        takenNames.delete(entry.filename.toLowerCase());
        entry.filename = renamed.name;
        takenNames.add(renamed.name.toLowerCase());
        entry.remoteMtime = Date.parse(renamed.modifiedTime);
        entry.syncedAt = now;
        saveState(state);
      }
      if (docChanged) {
        const written = await updateRemoteContent(token, entry.fileId, doc.content);
        entry.remoteMtime = Date.parse(written.modifiedTime);
        entry.syncedAt = now;
        outcome.filesWritten += 1;
        saveState(state);
      }
      continue;
    }

    // No Drive file (never synced, or trashed remotely) → export.
    const filename = entry?.filename ?? uniqueFilename(sanitizeName(doc.name), takenNames);
    const created = await createRemoteFile(token, folderId, filename, doc.content);
    state.entries[doc.id] = {
      fileId: created.id,
      filename: created.name,
      syncedAt: now,
      remoteMtime: Date.parse(created.modifiedTime),
    };
    takenNames.add(created.name.toLowerCase());
    outcome.filesWritten += 1;
    saveState(state);
  }

  // 3. Remote files nobody claims → import as new documents.
  const claimedIds = new Set(Object.values(state.entries).map((e) => e.fileId));
  for (const file of remote.values()) {
    if (claimedIds.has(file.id)) continue;
    const content = await downloadRemoteContent(token, file.id);
    const mtime = Date.parse(file.modifiedTime);
    const doc: Document = {
      id: generateId(),
      name: file.name.replace(/\.md$/i, ''),
      content,
      createdAt: mtime,
      updatedAt: mtime,
    };
    outcome.imported.push(doc);
    state.entries[doc.id] = { fileId: file.id, filename: file.name, syncedAt: now, remoteMtime: mtime };
    saveState(state);
  }

  saveState(state);
  return outcome;
}
