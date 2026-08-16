import React, { useEffect, useRef, useState } from 'react';
import { PanelLeft, Settings, Github } from 'lucide-react';
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
            'pointer-events-auto h-7 w-56 border border-input bg-background px-2 text-center',
            'font-mono text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-ring'
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
              <span className="cap-center truncate">{documentName}</span>
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
          onClick={() => window.open('https://github.com/RexO77/MarkdownStudioX', '_blank', 'noopener')}
        >
          <Github className={ICON.md} />
        </IconButton>
      </div>
    </Bar>
  );
};

export default ModernHeader;
