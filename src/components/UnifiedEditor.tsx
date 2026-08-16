import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { GalleyEditor, type GalleyFormatApi } from './galley/GalleyEditor';
import { EditorToolbar } from './editor/EditorToolbar';
import { FocusModeExit } from './editor/FocusModeExit';
import { EnhancedEditor } from './editor/EnhancedEditor';
import { TemplatePanel } from './editor/TemplatePanel';
import { SearchBar } from './SearchBar';
import { useFind } from '@/hooks/useFind';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcuts, insertTextAtCursor, formatLine } from '@/hooks/useKeyboardShortcuts';

export type EditorView = 'edit' | 'split' | 'read';

interface UnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  docId?: string;
  className?: string;
  formatRef?: React.MutableRefObject<((format: string) => void) | null>;
  onViewChange?: (view: EditorView) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  onOpenAIPanel?: () => void;
  /** Focus mode drops the toolbar too; the surface is all that is left. */
  isFocusMode?: boolean;
  onEnterFocus?: () => void;
  onExitFocus?: () => void;
}

const isGalleyFocused = () =>
  !!document.activeElement?.closest('.galley-editable');

// Marks TipTap already binds natively; re-applying them would toggle twice
const TIPTAP_NATIVE_SHORTCUTS = new Set(['bold', 'italic', 'code']);

const UnifiedEditor = ({
  value,
  onChange,
  docId,
  className,
  formatRef,
  onViewChange,
  onCursorChange,
  onOpenAIPanel,
  isFocusMode,
  onEnterFocus,
  onExitFocus,
}: UnifiedEditorProps) => {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<EditorView>('split');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const galleyApiRef = useRef<GalleyFormatApi | null>(null);
  const syncSource = useRef<'editor' | 'preview' | null>(null);
  const syncResetTimer = useRef<ReturnType<typeof setTimeout>>();

  const find = useFind(value);

  // Format handler for toolbar, keyboard shortcuts, and the command palette
  const handleFormat = useCallback(
    (format: string) => {
      const textarea = editorRef.current;
      if (!textarea) return;

      let result: { newValue: string; newCursorPos: number };

      switch (format) {
        case 'bold':
          result = insertTextAtCursor(textarea, '**', '**', 'bold text');
          break;
        case 'italic':
          result = insertTextAtCursor(textarea, '*', '*', 'italic text');
          break;
        case 'code':
          result = insertTextAtCursor(textarea, '`', '`', 'code');
          break;
        case 'link': {
          const selectedText = textarea.value.substring(
            textarea.selectionStart,
            textarea.selectionEnd
          );
          result = insertTextAtCursor(textarea, '[', '](url)', selectedText || 'link text');
          break;
        }
        case 'heading':
          result = formatLine(textarea, '# ');
          break;
        case 'list':
          result = formatLine(textarea, '- ');
          break;
        case 'quote':
          result = formatLine(textarea, '> ');
          break;
        case 'codeblock':
          result = insertTextAtCursor(textarea, '```\n', '\n```', 'code block');
          break;
        default:
          return;
      }

      onChange(result.newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.newCursorPos, result.newCursorPos);
      });
    },
    [onChange]
  );

  // Route a format action to whichever surface should receive it: the galley
  // when it has focus or is the only surface on screen, the source otherwise.
  const routeFormat = useCallback(
    (format: string) => {
      if (activeView === 'read' || isGalleyFocused()) {
        galleyApiRef.current?.applyFormat(format);
        return;
      }
      handleFormat(format);
    },
    [activeView, handleFormat]
  );

  // Keyboard shortcuts additionally skip marks TipTap handles itself
  const shortcutFormat = useCallback(
    (format: string) => {
      if (isGalleyFocused() && TIPTAP_NATIVE_SHORTCUTS.has(format)) return;
      routeFormat(format);
    },
    [routeFormat]
  );

  // Expose the format handler to the command palette
  useEffect(() => {
    if (formatRef) {
      formatRef.current = routeFormat;
      return () => {
        formatRef.current = null;
      };
    }
  }, [formatRef, routeFormat]);

  // Every unshifted binding says so: with `shift` left undefined the hook
  // matches either state, so ⌘⇧F would have run Find before reaching Focus.
  useKeyboardShortcuts({
    shortcuts: [
      { key: 'b', meta: true, shift: false, action: () => shortcutFormat('bold'), description: 'Bold' },
      { key: 'i', meta: true, shift: false, action: () => shortcutFormat('italic'), description: 'Italic' },
      { key: '`', meta: true, shift: false, action: () => shortcutFormat('code'), description: 'Inline Code' },
      { key: 'k', meta: true, shift: false, action: () => shortcutFormat('link'), description: 'Link' },
      { key: 'h', meta: true, shift: true, action: () => shortcutFormat('heading'), description: 'Heading' },
      { key: 'l', meta: true, shift: true, action: () => shortcutFormat('list'), description: 'List' },
      { key: 'q', meta: true, shift: true, action: () => shortcutFormat('quote'), description: 'Quote' },
      { key: 'c', meta: true, shift: true, action: () => shortcutFormat('codeblock'), description: 'Code Block' },
      { key: 'f', meta: true, shift: false, action: () => setShowSearch(true), description: 'Find' },
      { key: 'f', meta: true, shift: true, action: () => onEnterFocus?.(), description: 'Focus mode' },
    ],
    enabled: true,
  });

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    find.setQuery('');
  }, [find]);

  const handleSearchReplace = useCallback(
    (newContent: string) => {
      onChange(newContent);
    },
    [onChange]
  );

  // Mobile cannot split; fall back to the manuscript
  useEffect(() => {
    if (isMobile && activeView === 'split') {
      setActiveView('edit');
      onViewChange?.('edit');
    }
  }, [isMobile, activeView, onViewChange]);

  const handleViewChange = useCallback(
    (view: EditorView) => {
      const next = isMobile && view === 'split' ? 'edit' : view;
      setActiveView(next);
      onViewChange?.(next);
    },
    [isMobile, onViewChange]
  );

  useEffect(() => {
    onViewChange?.(activeView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // Synchronized scrolling: manuscript and galley move as one document
  // ------------------------------------------------------------------
  const markSyncSource = (source: 'editor' | 'preview') => {
    if (syncSource.current && syncSource.current !== source) return false;
    syncSource.current = source;
    if (syncResetTimer.current) clearTimeout(syncResetTimer.current);
    syncResetTimer.current = setTimeout(() => {
      syncSource.current = null;
    }, 120);
    return true;
  };

  const handleEditorScroll = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;
    if (!markSyncSource('editor')) return;

    const editorMax = editor.scrollHeight - editor.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (editorMax <= 0 || previewMax <= 0) return;

    preview.scrollTop = (editor.scrollTop / editorMax) * previewMax;
  }, []);

  const handlePreviewScroll = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;
    if (!markSyncSource('preview')) return;

    const editorMax = editor.scrollHeight - editor.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (editorMax <= 0 || previewMax <= 0) return;

    editor.scrollTop = (preview.scrollTop / previewMax) * editorMax;
  }, []);

  const showEdit = activeView === 'edit' || activeView === 'split';
  const showPreview = activeView === 'read' || activeView === 'split';
  const isSplit = activeView === 'split';

  const manuscript = (
    <EnhancedEditor
      ref={editorRef}
      value={value}
      onChange={onChange}
      onScroll={isSplit ? handleEditorScroll : undefined}
      onCursorChange={onCursorChange}
      className="h-full"
      measured={isFocusMode && !isSplit}
      placeholder="Start writing. The galley typesets as you go."
    />
  );

  const galley = (
    <GalleyEditor
      key={docId || 'galley'}
      ref={previewRef}
      value={value}
      onChange={onChange}
      formatApiRef={galleyApiRef}
      onScroll={isSplit ? handlePreviewScroll : undefined}
    />
  );

  return (
    <div className={cn('flex flex-col h-full bg-background relative', className)}>
      {isFocusMode ? (
        <FocusModeExit onExit={() => onExitFocus?.()} />
      ) : (
        <EditorToolbar
          showTemplates={showTemplates}
          onToggleTemplates={() => setShowTemplates((v) => !v)}
          activeView={activeView}
          onViewChange={handleViewChange}
          onFormat={routeFormat}
          onSearch={() => setShowSearch(true)}
          onOpenAIPanel={onOpenAIPanel}
          onEnterFocus={onEnterFocus}
        />
      )}

      <SearchBar
        isOpen={showSearch}
        onClose={handleCloseSearch}
        find={find}
        onReplace={handleSearchReplace}
      />

      <TemplatePanel
          visible={showTemplates}
          onInsertTemplate={(template) => {
            const textarea = editorRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue = value.substring(0, start) + template + value.substring(end);
              onChange(newValue);
              requestAnimationFrame(() => {
                textarea.focus();
                const pos = start + template.length;
                textarea.setSelectionRange(pos, pos);
              });
            } else {
              onChange(value + '\n\n' + template);
            }
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />

      <div className="flex-1 overflow-hidden">
        {isSplit ? (
          <PanelGroup direction="horizontal" autoSaveId="msx-split">
            <Panel defaultSize={50} minSize={25}>
              <div className="h-full bg-panel">{manuscript}</div>
            </Panel>
            <PanelResizeHandle className="group relative w-px bg-border data-[resize-handle-active]:bg-primary">
              <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
              <div className="absolute left-1/2 top-1/2 h-8 w-[3px] -translate-x-1/2 -translate-y-1/2 bg-border opacity-0 transition-opacity group-hover:opacity-100 group-data-[resize-handle-active]:bg-primary group-data-[resize-handle-active]:opacity-100" />
            </PanelResizeHandle>
            <Panel defaultSize={50} minSize={25}>
              {galley}
            </Panel>
          </PanelGroup>
        ) : showEdit ? (
          <div className="h-full bg-panel">{manuscript}</div>
        ) : showPreview ? (
          <div className="h-full">{galley}</div>
        ) : null}
      </div>
    </div>
  );
};

export default UnifiedEditor;
