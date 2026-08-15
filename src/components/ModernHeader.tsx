import React from 'react';
import { PanelLeft, Settings, Github } from 'lucide-react';
import ExportMenu from './ExportMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

interface ModernHeaderProps {
  content: string;
  documentName?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

const HeaderIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; shortcut?: string; active?: boolean }
>(({ label, shortcut, active, className, children, ...props }, ref) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        ref={ref}
        type="button"
        aria-label={shortcut ? `${label} (${shortcut})` : label}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center text-muted-foreground md:h-7 md:w-7',
          'hover:bg-secondary hover:text-foreground',
          'active:bg-foreground active:text-background',
          active && 'bg-secondary text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="flex items-center gap-2.5 font-mono text-[11px]">
      <span>{label}</span>
      {shortcut && <Kbd keys={shortcut} />}
    </TooltipContent>
  </Tooltip>
));
HeaderIconButton.displayName = 'HeaderIconButton';

const ModernHeader = ({
  content,
  documentName,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
}: ModernHeaderProps) => {
  return (
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-background px-2 md:px-3">
      <div className="flex min-w-0 items-center gap-2">
        <HeaderIconButton
          label={sidebarOpen ? 'Hide index' : 'Show index'}
          shortcut="⌘\"
          active={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </HeaderIconButton>

        {/* The man page names itself */}
        <span className="truncate font-mono text-[12px] font-bold tracking-[0.02em]">
          MARKDOWN-STUDIO-X(1)
        </span>
      </div>

      <span
        className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground md:block"
        aria-hidden="true"
      >
        User Commands
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <ExportMenu content={content} documentName={documentName} />

        <HeaderIconButton label="Settings" onClick={onOpenSettings}>
          <Settings className="h-3.5 w-3.5" />
        </HeaderIconButton>

        <HeaderIconButton
          label="Source on GitHub"
          onClick={() => window.open('https://github.com/RexO77/MarkdownStudioX', '_blank', 'noopener')}
        >
          <Github className="h-3.5 w-3.5" />
        </HeaderIconButton>
      </div>
    </header>
  );
};

export default ModernHeader;
