import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Document } from '@/hooks/useDocuments';
import {
  DriveAuthRequiredError,
  getAccessToken,
  isDriveSyncConfigured,
  signOutDrive,
  syncWithDrive,
  wasDriveConnected,
} from '@/lib/drive-sync';

export type DriveSyncStatus =
  | 'unconfigured'
  | 'signed-out'
  | 'needs-auth'
  | 'connected'
  | 'syncing'
  | 'error';

export interface UseDriveSyncReturn {
  status: DriveSyncStatus;
  lastSyncedAt: number | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncNow: () => void;
}

interface UseDriveSyncOptions {
  documents: Document[];
  onSyncApply: (changes: { updated: Document[]; imported: Document[] }) => void;
}

const CHANGE_DEBOUNCE_MS = 2500;

export const useDriveSync = ({ documents, onSyncApply }: UseDriveSyncOptions): UseDriveSyncReturn => {
  const configured = isDriveSyncConfigured();
  const [status, setStatus] = useState<DriveSyncStatus>(configured ? 'signed-out' : 'unconfigured');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const documentsRef = useRef(documents);
  documentsRef.current = documents;
  const onSyncApplyRef = useRef(onSyncApply);
  onSyncApplyRef.current = onSyncApply;
  const syncInFlight = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const statusRef = useRef(status);
  statusRef.current = status;

  const runSync = useCallback(async (interactive: boolean) => {
    if (syncInFlight.current) return;
    syncInFlight.current = true;
    setStatus('syncing');
    try {
      const token = await getAccessToken(interactive);
      const outcome = await syncWithDrive(token, documentsRef.current);
      if (outcome.updated.length || outcome.imported.length) {
        onSyncApplyRef.current({ updated: outcome.updated, imported: outcome.imported });
      }
      if (outcome.imported.length) {
        toast.success(
          outcome.imported.length === 1
            ? `Imported “${outcome.imported[0].name}” from Google Drive`
            : `Imported ${outcome.imported.length} documents from Google Drive`
        );
      }
      setLastSyncedAt(Date.now());
      setStatus('connected');
    } catch (err) {
      if (err instanceof DriveAuthRequiredError) {
        setStatus('needs-auth');
      } else {
        console.error('Drive sync failed:', err);
        setStatus('error');
        toast.error('Google Drive sync failed', {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    } finally {
      syncInFlight.current = false;
    }
  }, []);

  const syncNow = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    void runSync(false);
  }, [runSync]);

  // Resume a previous session silently — works while the user's Google
  // session is alive; otherwise we wait for a click on Reconnect.
  useEffect(() => {
    if (!configured || !wasDriveConnected()) return;
    void runSync(false);
  }, [configured, runSync]);

  // Write-through on edits.
  useEffect(() => {
    if (statusRef.current !== 'connected' && statusRef.current !== 'error') return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => void runSync(false), CHANGE_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [documents, runSync]);

  // Pull remote edits when the tab regains focus.
  useEffect(() => {
    const onFocus = () => {
      if (statusRef.current === 'connected') void runSync(false);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [runSync]);

  const connect = useCallback(async () => {
    await runSync(true);
  }, [runSync]);

  const disconnect = useCallback(async () => {
    await signOutDrive();
    setStatus('signed-out');
    setLastSyncedAt(null);
    toast.success('Google Drive disconnected', {
      description: 'Files stay in your Drive; documents stay in this browser.',
    });
  }, []);

  return { status, lastSyncedAt, connect, disconnect, syncNow };
};
