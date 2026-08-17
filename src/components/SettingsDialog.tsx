import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, ExternalLink, Trash2, FolderSync, RefreshCw, Cloud } from 'lucide-react';
import type { UseSyncFolderReturn } from '@/hooks/useSyncFolder';
import type { UseDriveSyncReturn } from '@/hooks/useDriveSync';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTheme } from '@/components/ui/theme-provider';
import {
  getStoredApiKey,
  setStoredApiKey,
  clearStoredApiKey,
} from '@/components/ui/api-key-dialog';
import {
  MANUSCRIPT_FACES,
  GALLEY_FACES,
  getManuscriptFace,
  getGalleyFace,
  setManuscriptFace,
  setGalleyFace,
  type ManuscriptFace,
  type GalleyFace,
} from '@/lib/typography';
import { cn } from '@/lib/utils';
import { Label, Segmented } from '@/components/chrome';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sync?: UseSyncFolderReturn;
  drive?: UseDriveSyncReturn;
}

const THEME_CHOICES = [
  { id: 'light' as const, label: 'LIGHT', Icon: Sun },
  { id: 'dark' as const, label: 'DARK', Icon: Moon },
  { id: 'system' as const, label: 'SYSTEM', Icon: Monitor },
];

const SectionHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3>
    <Label weight="strong" className="text-muted-foreground">
      {children}
    </Label>
  </h3>
);

const FACE_PREVIEW_STACKS: Record<string, string> = {
  typewriter: "'Courier Prime', 'Courier New', monospace",
  'system-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  serif: "'STIX Two Text', 'Times New Roman', serif",
};

const FaceOption: React.FC<{
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  previewStack: string;
}> = ({ selected, onClick, label, description, previewStack }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'flex flex-col gap-0.5 border px-2.5 py-2 text-left',
      selected
        ? 'border-foreground bg-foreground text-background'
        : 'border-border hover:bg-secondary'
    )}
  >
    <span className="text-[14px] leading-5" style={{ fontFamily: previewStack }}>
      Aa {label}
    </span>
    <Label className={selected ? 'text-background/70' : 'text-muted-foreground'}>
      {description}
    </Label>
  </button>
);

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange, sync, drive }) => {
  const { theme, setTheme } = useTheme();
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [manuscriptFace, setManuscriptFaceState] = useState<ManuscriptFace>(() => getManuscriptFace());
  const [galleyFace, setGalleyFaceState] = useState<GalleyFace>(() => getGalleyFace());

  const chooseManuscriptFace = (face: ManuscriptFace) => {
    setManuscriptFaceState(face);
    setManuscriptFace(face);
  };

  const chooseGalleyFace = (face: GalleyFace) => {
    setGalleyFaceState(face);
    setGalleyFace(face);
  };

  useEffect(() => {
    if (open) {
      const existing = getStoredApiKey();
      setHasKey(!!existing);
      setKeyInput(existing ? '••••••••••••' + existing.slice(-4) : '');
    }
  }, [open]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed || trimmed.startsWith('••••')) {
      toast.error('Enter a new key to save');
      return;
    }
    if (!trimmed.startsWith('gsk_')) {
      toast.error('Groq keys start with “gsk_”');
      return;
    }
    setStoredApiKey(trimmed);
    setHasKey(true);
    setKeyInput('••••••••••••' + trimmed.slice(-4));
    toast.success('API key saved', { description: 'Stored locally in this browser only.' });
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setHasKey(false);
    setKeyInput('');
    toast.success('API key removed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 border-border p-0 font-mono">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="font-mono text-[12px] font-bold uppercase tracking-[0.06em]">
            Settings
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-foreground">
            Stored in this browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-4 py-5">
          {/* Theme */}
          <section className="space-y-2">
            <SectionHead>Theme</SectionHead>
            <Segmented
              label="Theme"
              items={THEME_CHOICES}
              value={theme}
              onChange={setTheme}
              compactLabels={false}
              className="w-fit"
            />
          </section>

          {/* Manuscript face */}
          <section className="space-y-2">
            <SectionHead>Manuscript face — what you write in</SectionHead>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Manuscript face">
              {MANUSCRIPT_FACES.map((face) => (
                <FaceOption
                  key={face.value}
                  selected={manuscriptFace === face.value}
                  onClick={() => chooseManuscriptFace(face.value)}
                  label={face.label}
                  description={face.description}
                  previewStack={FACE_PREVIEW_STACKS[face.value]}
                />
              ))}
            </div>
          </section>

          {/* Galley face */}
          <section className="space-y-2">
            <SectionHead>Galley face — what the preview reads in</SectionHead>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Galley face">
              {GALLEY_FACES.map((face) => (
                <FaceOption
                  key={face.value}
                  selected={galleyFace === face.value}
                  onClick={() => chooseGalleyFace(face.value)}
                  label={face.label}
                  description={face.description}
                  previewStack={FACE_PREVIEW_STACKS[face.value]}
                />
              ))}
            </div>
          </section>

          {/* Sync folder */}
          {sync && (
            <section className="space-y-2">
              <SectionHead>Sync folder — documents as .md files</SectionHead>
              {sync.status === 'unsupported' ? (
                <p className="cap-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  Needs a Chromium browser (Chrome, Edge, Arc, Brave)
                </p>
              ) : sync.status === 'disconnected' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void sync.connect()}
                    className="inline-flex h-8 items-center gap-1.5 bg-primary px-3 text-primary-foreground hover:opacity-90"
                  >
                    <FolderSync className="h-3.5 w-3.5" />
                    <Label weight="strong">Choose folder…</Label>
                  </button>
                  <p className="cap-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    Point it at a Drive, OneDrive, iCloud or Dropbox folder and your documents sync everywhere as plain files
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-8 min-w-0 flex-1 items-center border border-input px-2 text-[12px]">
                      <span className="truncate">
                        {sync.folderName}
                        {sync.status === 'needs-permission' && ' — access needed'}
                        {sync.status === 'syncing' && ' — syncing…'}
                        {sync.status === 'error' && ' — sync failed'}
                      </span>
                    </span>
                    {sync.status === 'needs-permission' ? (
                      <button
                        type="button"
                        onClick={() => void sync.reconnect()}
                        className="inline-flex h-8 items-center bg-primary px-3 text-primary-foreground hover:opacity-90"
                      >
                        <Label weight="strong">Reconnect</Label>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sync.syncNow()}
                        aria-label="Sync now"
                        title="Sync now"
                        className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className={cn('h-3.5 w-3.5', sync.status === 'syncing' && 'animate-spin')} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void sync.disconnect()}
                      aria-label="Disconnect sync folder"
                      title="Disconnect"
                      className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="cap-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {sync.lastSyncedAt
                      ? `Two-way sync · last synced ${new Date(sync.lastSyncedAt).toLocaleTimeString()}`
                      : 'Two-way sync · files stay yours'}
                  </p>
                </>
              )}
            </section>
          )}

          {/* Google Drive sync */}
          {drive && drive.status !== 'unconfigured' && (
            <section className="space-y-2">
              <SectionHead>Cloud sync — Google Drive</SectionHead>
              {drive.status === 'signed-out' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void drive.connect()}
                    className="inline-flex h-8 items-center gap-1.5 bg-primary px-3 text-primary-foreground hover:opacity-90"
                  >
                    <Cloud className="h-3.5 w-3.5" />
                    <Label weight="strong">Sign in with Google</Label>
                  </button>
                  <p className="cap-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    Documents sync as .md files to a “Markdown Studio X” folder in your Drive · only files this app creates
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-8 min-w-0 flex-1 items-center border border-input px-2 text-[12px]">
                      <span className="truncate">
                        Google Drive
                        {drive.status === 'needs-auth' && ' — sign-in needed'}
                        {drive.status === 'syncing' && ' — syncing…'}
                        {drive.status === 'error' && ' — sync failed'}
                        {drive.status === 'connected' && ' — connected'}
                      </span>
                    </span>
                    {drive.status === 'needs-auth' ? (
                      <button
                        type="button"
                        onClick={() => void drive.connect()}
                        className="inline-flex h-8 items-center bg-primary px-3 text-primary-foreground hover:opacity-90"
                      >
                        <Label weight="strong">Sign in</Label>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => drive.syncNow()}
                        aria-label="Sync with Google Drive now"
                        title="Sync now"
                        className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className={cn('h-3.5 w-3.5', drive.status === 'syncing' && 'animate-spin')} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void drive.disconnect()}
                      aria-label="Disconnect Google Drive"
                      title="Disconnect"
                      className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="cap-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {drive.lastSyncedAt
                      ? `Two-way sync · last synced ${new Date(drive.lastSyncedAt).toLocaleTimeString()}`
                      : 'Two-way sync · your files, your Drive'}
                  </p>
                </>
              )}
            </section>
          )}

          {/* AI key */}
          <section className="space-y-2">
            <SectionHead>AI formatting — Groq API key</SectionHead>
            <div className="flex items-center gap-1.5">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="gsk_…"
                aria-label="Groq API key"
                className={cn(
                  'h-8 min-w-0 flex-1 border border-input bg-transparent px-2 text-[12px]',
                  'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring'
                )}
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="inline-flex h-8 items-center bg-primary px-3 text-primary-foreground hover:opacity-90"
              >
                <Label weight="strong">Save</Label>
              </button>
              {hasKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  aria-label="Remove API key"
                  className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="cap-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              {hasKey ? 'Key set · used only for AI formatting calls' : 'Optional · powers the AI format panel'}
              {' · '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="normal-case text-primary hover:underline"
              >
                get a free key <ExternalLink className="inline h-2.5 w-2.5" />
              </a>
            </p>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="cap-center text-[11px] tracking-[0.02em] text-muted-foreground">
            Markdown Studio X
          </span>
          <a
            href="https://github.com/RexO77/MarkdownStudioX"
            target="_blank"
            rel="noopener noreferrer"
            className="cap-center text-[11px] uppercase tracking-[0.04em] text-primary hover:underline"
          >
            Source ↗
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
