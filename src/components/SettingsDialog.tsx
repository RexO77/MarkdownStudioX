import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, ExternalLink, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEME_CHOICES = [
  { value: 'light' as const, label: 'LIGHT', icon: Sun },
  { value: 'dark' as const, label: 'DARK', icon: Moon },
  { value: 'system' as const, label: 'SYSTEM', icon: Monitor },
];

const SectionHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
    {children}
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
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-[0.04em]',
        selected ? 'text-background/70' : 'text-muted-foreground'
      )}
    >
      {description}
    </span>
  </button>
);

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
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
            <div
              role="group"
              aria-label="Theme"
              className="inline-flex items-stretch border border-border text-[11px] tracking-[0.04em]"
            >
              {THEME_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  aria-pressed={theme === choice.value}
                  onClick={() => setTheme(choice.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5',
                    theme === choice.value
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <choice.icon className="h-3 w-3" />
                  {choice.label}
                </button>
              ))}
            </div>
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
                className="h-8 bg-primary px-3 text-[11px] font-bold uppercase tracking-[0.04em] text-primary-foreground hover:opacity-90"
              >
                Save
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
            <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
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
          <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            markdown-studio-x(1)
          </span>
          <a
            href="https://github.com/RexO77/MarkdownStudioX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.04em] text-primary hover:underline"
          >
            Source ↗
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
