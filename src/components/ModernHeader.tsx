import React, { useEffect, useRef, useState } from 'react';
import { PanelLeft, Settings } from 'lucide-react';

// lucide-react 1.x dropped brand icons; the GitHub mark lives here instead.
const Github = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
import ExportMenu from './ExportMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Bar, HOVER, ICON, IconButton } from '@/components/chrome';
import { cn } from '@/lib/utils';

interface ModernHeaderProps {
  content: string;
  documentName?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onRenameDocument?: (name: string) => void;
}

/**
 * The document's name on the header's true midpoint. It is taken out of flow
 * so it cannot drift with the width of the clusters beside it, and clicking
 * it renames the document in place — the centre of the header is the one
 * thing on screen that names what you are editing.
 */
const DocumentTitle = ({
  documentName,
  onRename,
}: {
  documentName?: string;
  onRename?: (name: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(documentName ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!documentName) return null;

  const commit = () => {
    const next = draft.trim();
    if (next && next !== documentName) onRename?.(next);
    setEditing(false);
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') setEditing(false);
          }}
          aria-label="Document name"
          className={cn(
            'pointer-events-auto h-7 w-40 border border-input bg-background px-2 text-center md:w-56',
            'font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-ring md:text-[12px]'
          )}
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                setDraft(documentName);
                setEditing(true);
              }}
              className={cn(
                'pointer-events-auto hidden h-7 max-w-[min(24rem,40vw)] items-center px-2 md:inline-flex',
                'font-mono text-[12px] font-bold text-foreground',
                HOVER
              )}
            >
              <span className="truncate leading-none">{documentName}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-mono text-[11px]">
            Rename document
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

const ModernHeader = ({
  content,
  documentName,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onRenameDocument,
}: ModernHeaderProps) => {
  return (
    <Bar as="header" track="header" className="relative">
      <div className="flex min-w-0 items-center gap-1.5">
        <IconButton
          label={sidebarOpen ? 'Hide index' : 'Show index'}
          shortcut="⌘\"
          active={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <PanelLeft className={ICON.md} />
        </IconButton>

        <span className="cap-center truncate font-mono text-[12px] font-bold tracking-[0.02em]">
          Markdown Studio X
        </span>
      </div>

      <DocumentTitle documentName={documentName} onRename={onRenameDocument} />

      <div className="flex shrink-0 items-center gap-0.5">
        <ExportMenu content={content} documentName={documentName} />

        <IconButton label="Settings" onClick={onOpenSettings}>
          <Settings className={ICON.md} />
        </IconButton>

        <IconButton
          label="Source on GitHub"
          // The one header affordance that yields at 320px — the wordmark
          // should not be the first casualty of a narrow proof sheet.
          className="hidden sm:inline-flex"
          onClick={() => window.open('https://github.com/RexO77/MarkdownStudioX', '_blank', 'noopener')}
        >
          <Github className={ICON.md} />
        </IconButton>
      </div>
    </Bar>
  );
};

export default ModernHeader;
