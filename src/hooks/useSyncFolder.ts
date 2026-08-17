import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Document } from '@/hooks/useDocuments';
import {
  checkPermission,
  forgetFolder,
  isFolderSyncSupported,
  loadFolderHandle,
  pickSyncFolder,
  syncWithFolder,
  type SyncOutcome,
} from '@/lib/sync-folder';

export type SyncFolderStatus =
  | 'unsupported'
  | 'disconnected'
  | 'needs-permission'
  | 'connected'
  | 'syncing'
  | 'error';

export interface UseSyncFolderReturn {
  status: SyncFolderStatus;
  folderName: string | null;
  lastSyncedAt: number | null;
  connect: () => Promise<void>;
  reconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncNow: () => void;
}

interface UseSyncFolderOptions {
  documents: Document[];
  /** Merge file-side changes into the document store without bumping updatedAt. */
  onSyncApply: (changes: { updated: Document[]; imported: Document[] }) => void;
}

const CHANGE_DEBOUNCE_MS = 1500;

export const useSyncFolder = ({ documents, onSyncApply }: UseSyncFolderOptions): UseSyncFolderReturn => {
  const supported = isFolderSyncSupported();
  const [status, setStatus] = useState<SyncFolderStatus>(supported ? 'disconnected' : 'unsupported');
  const [folderName, setFolderName] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const handleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const documentsRef = useRef(documents);
  documentsRef.current = documents;
  const onSyncApplyRef = useRef(onSyncApply);
  onSyncApplyRef.current = onSyncApply;
  const syncInFlight = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const statusRef = useRef(status);
  statusRef.current = status;

  const runSync = useCallback(async () => {
    const handle = handleRef.current;
    if (!handle || syncInFlight.current) return;
    syncInFlight.current = true;
    setStatus('syncing');
    try {
      const outcome: SyncOutcome = await syncWithFolder(handle, documentsRef.current);
      if (outcome.updated.length || outcome.imported.length) {
        onSyncApplyRef.current({ updated: outcome.updated, imported: outcome.imported });
      }
      if (outcome.imported.length) {
        toast.success(
          outcome.imported.length === 1
            ? `Imported “${outcome.imported[0].name}” from the sync folder`
            : `Imported ${outcome.imported.length} documents from the sync folder`
        );
      }
      setLastSyncedAt(Date.now());
      setStatus('connected');
    } catch (err) {
      console.error('Folder sync failed:', err);
      setStatus('error');
      toast.error('Folder sync failed', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      syncInFlight.current = false;
    }
  }, []);

  const syncNow = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    void runSync();
  }, [runSync]);

  // Restore the saved folder on startup. Browsers may remember the grant
  // ('granted') or hold it until a user gesture ('prompt').
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    (async () => {
      const handle = await loadFolderHandle();
      if (!handle || cancelled) return;
      handleRef.current = handle;
      setFolderName(handle.name);
      const permission = await checkPermission(handle, false);
      if (cancelled) return;
      if (permission === 'granted') {
        setStatus('connected');
        void runSync();
      } else if (permission === 'prompt') {
        setStatus('needs-permission');
      } else {
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported, runSync]);

  // Write-through: document changes settle into the folder after a pause.
  useEffect(() => {
    if (statusRef.current !== 'connected' && statusRef.current !== 'error') return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => void runSync(), CHANGE_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [documents, runSync]);

  // Pick up external edits when the user comes back to the tab.
  useEffect(() => {
    const onFocus = () => {
      if (statusRef.current === 'connected') void runSync();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [runSync]);

  const connect = useCallback(async () => {
    try {
      const handle = await pickSyncFolder();
      handleRef.current = handle;
      setFolderName(handle.name);
      setStatus('connected');
      toast.success(`Sync folder connected: ${handle.name}`, {
        description: 'Documents now save as .md files you own.',
      });
      void runSync();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return; // user closed the picker
      toast.error('Could not connect the folder', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }, [runSync]);

  const reconnect = useCallback(async () => {
    const handle = handleRef.current;
    if (!handle) return connect();
    const permission = await checkPermission(handle, true);
    if (permission === 'granted') {
      setStatus('connected');
      void runSync();
    } else {
      toast.error('Folder access was not granted');
    }
  }, [connect, runSync]);

  const disconnect = useCallback(async () => {
    handleRef.current = null;
    setFolderName(null);
    setLastSyncedAt(null);
    setStatus('disconnected');
    await forgetFolder();
    toast.success('Sync folder disconnected', {
      description: 'Files stay in the folder; documents stay in this browser.',
    });
  }, []);

  return { status, folderName, lastSyncedAt, connect, reconnect, disconnect, syncNow };
};
