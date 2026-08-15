import React from 'react';
import {
  CodeXml, Feather, Columns2, Sparkles, LayoutTemplate,
  Bold, Italic, Code, Heading1, List, Quote, Link, Search, SquareCode,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { EditorView } from '../UnifiedEditor';

interface EditorToolbarProps {
  onSmartFormat?: () => void;
  isProcessing?: boolean;
  showTemplates: boolean;
  onToggleTemplates: () => void;
  activeView: EditorView;
  onViewChange: (view: EditorView) => void;
  onFormat?: (format: string) => void;
  onSearch?: () => void;
  onOpenAIPanel?: () => void;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, shortcut, onClick, disabled, active }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        disabled={disabled}
        aria-label={shortcut ? `${label} (${shortcut})` : label}
        aria-pressed={active}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center text-muted-foreground md:h-7 md:w-7',
          'hover:bg-secondary hover:text-foreground',
          'active:bg-foreground active:text-background',
          'disabled:pointer-events-none disabled:opacity-40',
          active && 'bg-secondary text-foreground'
        )}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="flex items-center gap-2.5 font-mono text-[11px]">
      <span>{label}</span>
      {shortcut && <Kbd keys={shortcut} />}
    </TooltipContent>
  </Tooltip>
);

const VIEWS: {
  id: EditorView;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  mobileHidden?: boolean;
}[] = [
  { id: 'edit', label: 'SOURCE', Icon: CodeXml },
  { id: 'split', label: 'SPLIT', Icon: Columns2, mobileHidden: true },
  { id: 'read', label: 'GALLEY', Icon: Feather },
];

export const EditorToolbar = ({
  showTemplates,
  onToggleTemplates,
  activeView,
  onViewChange,
  onFormat,
  onSearch,
  onOpenAIPanel,
}: EditorToolbarProps) => {
  const isMobile = useIsMobile();

  const formatButtons = [
    { icon: <Bold className="h-3.5 w-3.5" />, label: 'Bold', shortcut: '⌘B', format: 'bold' },
    { icon: <Italic className="h-3.5 w-3.5" />, label: 'Italic', shortcut: '⌘I', format: 'italic' },
    { icon: <Code className="h-3.5 w-3.5" />, label: 'Inline code', shortcut: '⌘`', format: 'code' },
    { icon: <Heading1 className="h-3.5 w-3.5" />, label: 'Heading', shortcut: '⌘⇧H', format: 'heading' },
    { icon: <List className="h-3.5 w-3.5" />, label: 'List', shortcut: '⌘⇧L', format: 'list' },
    { icon: <Quote className="h-3.5 w-3.5" />, label: 'Quote', shortcut: '⌘⇧Q', format: 'quote' },
    { icon: <SquareCode className="h-3.5 w-3.5" />, label: 'Code block', shortcut: '⌘⇧C', format: 'codeblock' },
    { icon: <Link className="h-3.5 w-3.5" />, label: 'Link', shortcut: '⌘K', format: 'link' },
  ];

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-background px-2">
      <div className="flex min-w-0 items-center gap-0.5">
        {formatButtons.map((btn) => (
          <ToolbarButton
            key={btn.format}
            icon={btn.icon}
            label={btn.label}
            shortcut={btn.shortcut}
            onClick={() => onFormat?.(btn.format)}
          />
        ))}

        <div className="mx-1.5 h-4 w-px bg-border" aria-hidden="true" />

        <ToolbarButton
          icon={<Search className="h-3.5 w-3.5" />}
          label="Find & replace"
          shortcut="⌘F"
          onClick={() => onSearch?.()}
        />

        <div className="mx-1.5 h-4 w-px bg-border" aria-hidden="true" />

        <ToolbarButton
          icon={<LayoutTemplate className="h-3.5 w-3.5" />}
          label="Insert template"
          onClick={onToggleTemplates}
          active={showTemplates}
        />

        {onOpenAIPanel && (
          <ToolbarButton
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="AI formatting"
            onClick={onOpenAIPanel}
          />
        )}
      </div>

      {/* View switcher: a 3-cell group. Inverse fill is the active cell. */}
      <div
        role="group"
        aria-label="Editor view"
        className="flex h-7 shrink-0 items-stretch border border-border font-mono text-[11px] leading-none tracking-[0.04em] md:h-6"
      >
        {VIEWS.filter((v) => !(isMobile && v.mobileHidden)).map((view, index) => {
          const selected = activeView === view.id;
          return (
            <button
              key={view.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onViewChange(view.id)}
              className={cn(
                'inline-flex h-full items-center gap-1.5 px-2.5',
                index > 0 && 'border-l border-border',
                selected
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <view.Icon className="size-3 shrink-0" strokeWidth={1.75} />
              <span className="hidden leading-none sm:inline">{view.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
