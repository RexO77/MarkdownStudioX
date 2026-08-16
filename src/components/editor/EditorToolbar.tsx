import React from 'react';
import {
  CodeXml, Feather, Columns2, Sparkles, LayoutTemplate,
  Bold, Italic, Code, Heading1, List, Quote, Link, Search, SquareCode, Maximize2,
} from 'lucide-react';
import { Bar, BarDivider, ICON, IconButton, Segmented, type SegmentedItem } from '@/components/chrome';
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
  onEnterFocus?: () => void;
}

const VIEWS: SegmentedItem<EditorView>[] = [
  { id: 'edit', label: 'MARKDOWN', shortcut: 'M', Icon: CodeXml },
  { id: 'split', label: 'SPLIT', shortcut: 'S', Icon: Columns2, mobileHidden: true },
  { id: 'read', label: 'RICH TEXT', shortcut: 'G', Icon: Feather },
];

const FORMAT_BUTTONS = [
  { Icon: Bold, label: 'Bold', shortcut: '⌘B', format: 'bold' },
  { Icon: Italic, label: 'Italic', shortcut: '⌘I', format: 'italic' },
  { Icon: Code, label: 'Inline code', shortcut: '⌘`', format: 'code' },
  { Icon: Heading1, label: 'Heading', shortcut: '⌘⇧H', format: 'heading' },
  { Icon: List, label: 'List', shortcut: '⌘⇧L', format: 'list' },
  { Icon: Quote, label: 'Quote', shortcut: '⌘⇧Q', format: 'quote' },
  { Icon: SquareCode, label: 'Code block', shortcut: '⌘⇧C', format: 'codeblock' },
  { Icon: Link, label: 'Link', shortcut: '⌘K', format: 'link' },
];

export const EditorToolbar = ({
  showTemplates,
  onToggleTemplates,
  activeView,
  onViewChange,
  onFormat,
  onSearch,
  onOpenAIPanel,
  onEnterFocus,
}: EditorToolbarProps) => {
  const isMobile = useIsMobile();

  return (
    <Bar track="toolbar">
      <div className="flex min-w-0 items-center">
        {FORMAT_BUTTONS.map((btn) => (
          <IconButton
            key={btn.format}
            label={btn.label}
            shortcut={btn.shortcut}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat?.(btn.format)}
          >
            <btn.Icon className={ICON.md} />
          </IconButton>
        ))}

        <BarDivider />

        <IconButton
          label="Find & replace"
          shortcut="⌘F"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSearch?.()}
        >
          <Search className={ICON.md} />
        </IconButton>

        <BarDivider />

        <IconButton
          label="Insert template"
          active={showTemplates}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleTemplates}
        >
          <LayoutTemplate className={ICON.md} />
        </IconButton>

        {onOpenAIPanel && (
          <IconButton
            label="AI formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenAIPanel}
          >
            <Sparkles className={ICON.md} />
          </IconButton>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {onEnterFocus && (
          <IconButton label="Focus mode" shortcut="⌘⇧F" onClick={onEnterFocus}>
            <Maximize2 className={ICON.md} />
          </IconButton>
        )}

        <Segmented
          label="Editor view"
          items={VIEWS.filter((v) => !(isMobile && v.mobileHidden))}
          value={activeView}
          onChange={onViewChange}
        />
      </div>
    </Bar>
  );
};
