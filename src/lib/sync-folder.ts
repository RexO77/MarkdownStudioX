import type { Document } from '@/hooks/useDocuments';

/**
 * Folder sync: documents mirror to real .md files in a directory the user
 * picks (File System Access API, Chromium only). Point it at a cloud-synced
 * folder — Google Drive, OneDrive, iCloud, Dropbox — and the native sync
 * client carries the files everywhere; the app never talks to a cloud API.
 *
 * Model: localStorage stays the source of truth for which documents exist;
 * the folder is a live two-way mirror of their content.
 *   - App-side edits, renames, deletes propagate to files.
 *   - File-side content edits propagate back (newer mtime wins).
 *   - Unrecognized .md files in the folder import as new documents.
 *   - A file deleted externally is re-exported, not treated as a delete —
 *     losing a file must never silently destroy a document.
 *   - External renames aren't tracked (no stable file id): the old name
 *     re-exports and the new name imports as a copy.
 */

const DB_NAME = 'markdown-studio-sync';
const DB_STORE = 'handles';
const HANDLE_KEY = 'sync-folder';
const SYNC_STATE_KEY = 'markdown-studio-sync-state';

/** File mtimes are coarse on some filesystems; ignore drift below this. */
const MTIME_SLACK_MS = 1500;

interface SyncEntry {
  filename: string;
  /** When we last reconciled this document (Date.now at sync time). */
  syncedAt: number;
  /** file.lastModified observed at that reconciliation. */
  fileMtime: number;
}

type SyncState = Record<string, SyncEntry>;

export interface SyncOutcome {
  /** Documents whose content was replaced by a newer file. */
  updated: Document[];
  /** New documents imported from files the app didn't know about. */
  imported: Document[];
  filesWritten: number;
  filesDeleted: number;
}

export const isFolderSyncSupported = (): boolean =>
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

// ---------------------------------------------------------------------------
// Directory-handle persistence (IndexedDB — handles are structured-cloneable)

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbRequest<T>(run: (store: IDBObjectStore) => IDBRequest<T>, mode: IDBTransactionMode): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = run(db.transaction(DB_STORE, mode).objectStore(DB_STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function loadFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return (await idbRequest((s) => s.get(HANDLE_KEY), 'readonly')) ?? null;
  } catch {
    return null;
  }
}

async function saveFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await idbRequest((s) => s.put(handle, HANDLE_KEY), 'readwrite');
}

export async function forgetFolder(): Promise<void> {
  try {
    await idbRequest((s) => s.delete(HANDLE_KEY), 'readwrite');
  } catch {
    // Losing the handle store just means reconnecting later.
  }
  localStorage.removeItem(SYNC_STATE_KEY);
}

// ---------------------------------------------------------------------------
// Permissions

export type FolderPermission = 'granted' | 'prompt' | 'denied';

export async function checkPermission(
  handle: FileSystemDirectoryHandle,
  request: boolean
): Promise<FolderPermission> {
  const options = { mode: 'readwrite' as const };
  let state = await handle.queryPermission(options);
  if (state === 'prompt' && request) {
    state = await handle.requestPermission(options);
  }
  return state as FolderPermission;
}

/** Must be called from a user gesture (button click). */
export async function pickSyncFolder(): Promise<FileSystemDirectoryHandle> {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  await saveFolderHandle(handle);
  localStorage.removeItem(SYNC_STATE_KEY);
  return handle;
}

// ---------------------------------------------------------------------------
// Sync state

function loadState(): SyncState {
  try {
    return JSON.parse(localStorage.getItem(SYNC_STATE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveState(state: SyncState): void {
  localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Filenames

export function sanitizeName(name: string): string {
  const cleaned = name
    // eslint-disable-next-line no-control-regex -- control chars are illegal in filenames
    .replace(/[\\/:*?"<>|\u0000-\u001f-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')
    .slice(0, 80)
    .trim();
  return cleaned || 'Untitled';
}

export function uniqueFilename(base: string, taken: Set<string>): string {
  let candidate = `${base}.md`;
  for (let n = 2; taken.has(candidate.toLowerCase()); n += 1) {
    candidate = `${base} (${n}).md`;
  }
  return candidate;
}

const generateId = (): string =>
  `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// ---------------------------------------------------------------------------
// The sync pass

async function writeFile(
  dir: FileSystemDirectoryHandle,
  filename: string,
  content: string
): Promise<number> {
  const fh = await dir.getFileHandle(filename, { create: true });
  const writable = await fh.createWritable();
  await writable.write(content);
  await writable.close();
  return (await fh.getFile()).lastModified;
}

async function listMarkdownFiles(
  dir: FileSystemDirectoryHandle
): Promise<Map<string, FileSystemFileHandle>> {
  const files = new Map<string, FileSystemFileHandle>();
  for await (const entry of dir.values()) {
    if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.md')) {
      files.set(entry.name, entry);
    }
  }
  return files;
}

/**
 * Reconcile the document list with the folder. Pure with respect to React —
 * the caller applies `updated`/`imported` to its own state.
 */
export async function syncWithFolder(
  dir: FileSystemDirectoryHandle,
  documents: Document[]
): Promise<SyncOutcome> {
  const state = loadState();
  const files = await listMarkdownFiles(dir);
  const outcome: SyncOutcome = { updated: [], imported: [], filesWritten: 0, filesDeleted: 0 };
  const now = Date.now();

  // 1. Documents deleted in the app → delete their files.
  const docIds = new Set(documents.map((d) => d.id));
  for (const [id, entry] of Object.entries(state)) {
    if (docIds.has(id)) continue;
    if (files.has(entry.filename)) {
      try {
        await dir.removeEntry(entry.filename);
        files.delete(entry.filename);
        outcome.filesDeleted += 1;
        delete state[id];
        saveState(state);
      } catch {
        // File still present — keep the mapping so the import loop
        // does not resurrect the deleted document.
      }
    } else {
      delete state[id];
      saveState(state);
    }
  }

  // Occupied names: mapped documents *and* every .md already in the folder,
  // so a rename cannot truncate an unclaimed file that shares the new name.
  const takenNames = new Set<string>();
  for (const entry of Object.values(state)) takenNames.add(entry.filename.toLowerCase());
  for (const name of files.keys()) takenNames.add(name.toLowerCase());

  // 2. Reconcile each document with its file.
  for (const doc of documents) {
    const entry = state[doc.id];
    const file = entry ? files.get(entry.filename) : undefined;

    if (entry && file) {
      const stat = await file.getFile();
      const docChanged = doc.updatedAt > entry.syncedAt;
      const fileChanged = stat.lastModified > entry.fileMtime + MTIME_SLACK_MS;

      if (fileChanged && (!docChanged || stat.lastModified >= doc.updatedAt)) {
        // File wins: pull content in. Timestamp mirrors the file so the
        // next pass sees both sides settled.
        const content = await stat.text();
        if (content !== doc.content) {
          outcome.updated.push({ ...doc, content, updatedAt: stat.lastModified });
        }
        entry.fileMtime = stat.lastModified;
        entry.syncedAt = now;
        saveState(state);
        continue;
      }

      // App wins (or nothing changed). Handle renames, then content.
      const desired = uniqueFilename(
        sanitizeName(doc.name),
        new Set([...takenNames].filter((n) => n !== entry.filename.toLowerCase()))
      );
      if (desired !== entry.filename) {
        try {
          entry.fileMtime = await writeFile(dir, desired, doc.content);
          await dir.removeEntry(entry.filename);
          files.delete(entry.filename);
          takenNames.delete(entry.filename.toLowerCase());
          entry.filename = desired;
          takenNames.add(desired.toLowerCase());
          entry.syncedAt = now;
          outcome.filesWritten += 1;
          saveState(state);
          continue;
        } catch {
          // Rename failed; fall through and keep the old name working.
        }
      }
      if (docChanged) {
        entry.fileMtime = await writeFile(dir, entry.filename, doc.content);
        entry.syncedAt = now;
        outcome.filesWritten += 1;
        saveState(state);
      }
      continue;
    }

    // No file (never synced, or it vanished externally) → export it.
    const filename = entry?.filename && !files.has(entry.filename)
      ? entry.filename
      : uniqueFilename(sanitizeName(doc.name), takenNames);
    const fileMtime = await writeFile(dir, filename, doc.content);
    state[doc.id] = { filename, syncedAt: now, fileMtime };
    takenNames.add(filename.toLowerCase());
    outcome.filesWritten += 1;
    saveState(state);
  }

  // 3. Files nobody claims → import as new documents.
  const claimed = new Set(Object.values(state).map((e) => e.filename));
  for (const [filename, handle] of files) {
    if (claimed.has(filename)) continue;
    const stat = await handle.getFile();
    const doc: Document = {
      id: generateId(),
      name: filename.replace(/\.md$/i, ''),
      content: await stat.text(),
      createdAt: stat.lastModified,
      updatedAt: stat.lastModified,
    };
    outcome.imported.push(doc);
    state[doc.id] = { filename, syncedAt: now, fileMtime: stat.lastModified };
    saveState(state);
  }

  saveState(state);
  return outcome;
}
