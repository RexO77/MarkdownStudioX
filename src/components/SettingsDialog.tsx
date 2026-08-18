import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Sun,
  Moon,
  Monitor,
  Type,
  Sparkles,
  ExternalLink,
  Trash2,
  FolderSync,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import type { UseSyncFolderReturn } from '@/hooks/useSyncFolder';
import type { UseDriveSyncReturn } from '@/hooks/useDriveSync';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/components/ui/theme-provider';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '@/components/ui/api-key-dialog';
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
import { Hint, Label, Segmented } from '@/components/chrome';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sync?: UseSyncFolderReturn;
  drive?: UseDriveSyncReturn;
}

/** Natural case in the data; the label cut does the uppercasing. */
const THEME_CHOICES = [
  { id: 'light' as const, label: 'Light', Icon: Sun },
  { id: 'dark' as const, label: 'Dark', Icon: Moon },
  { id: 'system' as const, label: 'System', Icon: Monitor },
];

type PaneId = 'theme' | 'typefaces' | 'sync' | 'ai';

/**
 * One pane of the dialog. The rail on the left already names the pane and
 * holds it in inverse video, so the pane does not repeat its own title — it
 * opens on the sentence that explains what the controls below decide.
 */
const Pane: React.FC<{ id: PaneId; hint?: React.ReactNode; children: React.ReactNode }> = ({
  id,
  hint,
  children,
}) => (
  <Tabs.Content
    value={id}
    className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 focus:outline-none"
  >
    {hint && <Hint className="max-w-[58ch]">{hint}</Hint>}
    {children}
  </Tabs.Content>
);

/** Names a control inside a pane — one or two words, never a sentence. */
const FieldHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4>
    <Label className="text-muted-foreground">{children}</Label>
  </h4>
);

/** A rail row: 12px icon, an 11px label, inverse video when it is the open pane. */
const RailTab: React.FC<{
  id: PaneId;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}> = ({ id, Icon, children }) => (
  <Tabs.Trigger
    value={id}
    className={cn(
      'flex h-8 w-full items-center gap-2 px-3 text-left text-muted-foreground',
      // In the top-row cut each tab sizes to its word instead of the rail width.
      'max-sm:h-9 max-sm:w-auto max-sm:shrink-0',
      'hover:bg-secondary hover:text-foreground',
      'data-[state=active]:bg-foreground data-[state=active]:text-background'
    )}
  >
    <Icon className="size-3 shrink-0" strokeWidth={1.75} />
    <Label weight="strong">{children}</Label>
  </Tabs.Trigger>
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
      selected ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-secondary'
    )}
  >
    <span className="text-[14px] leading-5" style={{ fontFamily: previewStack }}>
      Aa {label}
    </span>
    <Hint as="span" className={selected ? 'text-background/70' : undefined}>
      {description}
    </Hint>
  </button>
);

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange, sync, drive }) => {
  const { theme, setTheme } = useTheme();
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [manuscriptFace, setManuscriptFaceState] = useState<ManuscriptFace>(() => getManuscriptFace());
  const [galleyFace, setGalleyFaceState] = useState<GalleyFace>(() => getGalleyFace());
  const [pane, setPane] = useState<PaneId>('theme');

  /** The sync rail row only stands if there is something behind it. */
  const hasSync = Boolean(sync || (drive && drive.status !== 'unconfigured'));

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

  /** Sync can disappear mid-session; never strand the rail on a pane that left. */
  useEffect(() => {
    if (!hasSync && pane === 'sync') setPane('theme');
  }, [hasSync, pane]);

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
    toast.success('API key saved', {
      description: 'Stored locally in this browser only.',
    });
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setHasKey(false);
    setKeyInput('');
    toast.success('API key removed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Fixed height, not fit-content: the rail must not jump as panes swap.
          dvh, not vh — under a collapsing mobile URL bar a vh height puts the
          footer past the fold with no way to scroll to it. */}
      <DialogContent className="flex h-[min(82dvh,440px)] max-w-2xl flex-col gap-0 overflow-hidden border-border p-0 font-mono">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3">
          <DialogTitle className="font-mono text-[12px] font-bold uppercase tracking-[0.06em]">
            Settings
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-foreground">
            Stored in this browser only.
          </DialogDescription>
        </DialogHeader>

        <Tabs.Root
          value={pane}
          onValueChange={(value) => setPane(value as PaneId)}
          orientation="vertical"
          className="flex min-h-0 flex-1 max-sm:flex-col"
        >
          {/* The contents rail — arrow keys move between panes. Below sm the
              144px column would leave a 191px pane, so the rail becomes a
              pannable top row instead. */}
          <Tabs.List
            aria-label="Settings sections"
            className={cn(
              'w-36 shrink-0 space-y-px border-r border-border py-1.5',
              'max-sm:scrollbar-none max-sm:flex max-sm:w-full max-sm:space-y-0 max-sm:overflow-x-auto max-sm:border-b max-sm:border-r-0 max-sm:py-0'
            )}
          >
            <RailTab id="theme" Icon={Sun}>
              Theme
            </RailTab>
            <RailTab id="typefaces" Icon={Type}>
              Typefaces
            </RailTab>
            {hasSync && (
              <RailTab id="sync" Icon={FolderSync}>
                Sync
              </RailTab>
            )}
            <RailTab id="ai" Icon={Sparkles}>
              AI
            </RailTab>
          </Tabs.List>

          <Pane id="theme" hint="How the app renders — the galley follows the chrome.">
            <Segmented
              label="Theme"
              items={THEME_CHOICES}
              value={theme}
              onChange={setTheme}
              compactLabels={false}
              className="w-fit"
            />
          </Pane>

          {/* Typefaces — the two faces read as one decision, so they share a pane */}
          <Pane
            id="typefaces"
            hint="Manuscript is the face you write in; galley is the face the preview reads in."
          >
            <div className="space-y-1.5">
              <FieldHead>Manuscript</FieldHead>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-3" role="group" aria-label="Manuscript face">
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
            </div>

            <div className="space-y-1.5">
              <FieldHead>Galley</FieldHead>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-3" role="group" aria-label="Galley face">
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
            </div>
          </Pane>

          {/* Sync — folder and Drive are two routes to the same outcome */}
          {hasSync && (
            <Pane id="sync" hint="Your documents, mirrored out as plain .md files.">
              {sync && (
                <div className="space-y-1.5">
                  <FieldHead>Folder</FieldHead>
                  {sync.status === 'unsupported' ? (
                    <Hint>Needs a Chromium browser — Chrome, Edge, Arc or Brave.</Hint>
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
                      <Hint>
                        Point it at a Drive, OneDrive, iCloud or Dropbox folder and your documents follow you
                        everywhere as plain files.
                      </Hint>
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
                            <RefreshCw
                              className={cn('h-3.5 w-3.5', sync.status === 'syncing' && 'animate-spin')}
                            />
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
                      <Hint className="tabular-nums">
                        {sync.lastSyncedAt
                          ? `Two-way · last synced ${new Date(sync.lastSyncedAt).toLocaleTimeString()}`
                          : 'Two-way · files stay yours'}
                      </Hint>
                    </>
                  )}
                </div>
              )}

              {drive && drive.status !== 'unconfigured' && (
                <div className="space-y-1.5">
                  <FieldHead>Google Drive</FieldHead>
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
                      <Hint>
                        Syncs to a “Markdown Studio X” folder in your Drive. This app only ever sees the files
                        it created.
                      </Hint>
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
                            <RefreshCw
                              className={cn('h-3.5 w-3.5', drive.status === 'syncing' && 'animate-spin')}
                            />
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
                      <Hint className="tabular-nums">
                        {drive.lastSyncedAt
                          ? `Two-way · last synced ${new Date(drive.lastSyncedAt).toLocaleTimeString()}`
                          : 'Two-way · your files, your Drive'}
                      </Hint>
                    </>
                  )}
                </div>
              )}
            </Pane>
          )}

          {/* AI key */}
          <Pane id="ai" hint="Optional — powers the AI format panel.">
            <div className="flex max-w-md items-center gap-1.5">
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
            <Hint>
              {hasKey ? 'Key set — used only for AI formatting calls.' : 'Needs a Groq key.'}{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get a free key <ExternalLink className="inline h-2.5 w-2.5" />
              </a>
            </Hint>
          </Pane>
        </Tabs.Root>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2">
          <Hint as="span">Markdown Studio X</Hint>
          <a
            href="https://github.com/RexO77/MarkdownStudioX"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] leading-4 text-primary hover:underline"
          >
            Source ↗
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
