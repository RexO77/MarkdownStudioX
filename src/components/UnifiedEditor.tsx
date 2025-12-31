
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Preview from './Preview';
import { EditorToolbar } from './editor/EditorToolbar';
import { EnhancedEditor } from './editor/EnhancedEditor';
import { TemplatePanel } from './editor/TemplatePanel';
import { SearchBar } from './SearchBar';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useFind } from '@/hooks/useFind';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcuts, insertTextAtCursor, formatLine } from '@/hooks/useKeyboardShortcuts';

interface UnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UnifiedEditor = ({ value, onChange, className }: UnifiedEditorProps) => {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const { smartFormat, isProcessing } = useSmartEditor({
    onContentChange: onChange,
    currentContent: value
  });

  const find = useFind(value);

  // Format handler for toolbar and keyboard shortcuts
  const handleFormat = useCallback((format: string) => {
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
      case 'link':
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        result = insertTextAtCursor(textarea, '[', '](url)', selectedText || 'link text');
        break;
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

    // Restore cursor position after state update
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.newCursorPos, result.newCursorPos);
    });
  }, [onChange]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      { key: 'b', meta: true, action: () => handleFormat('bold'), description: 'Bold' },
      { key: 'i', meta: true, action: () => handleFormat('italic'), description: 'Italic' },
      { key: '`', meta: true, action: () => handleFormat('code'), description: 'Inline Code' },
      { key: 'k', meta: true, shift: false, action: () => handleFormat('link'), description: 'Link' },
      { key: 'h', meta: true, shift: true, action: () => handleFormat('heading'), description: 'Heading' },
      { key: 'l', meta: true, shift: true, action: () => handleFormat('list'), description: 'List' },
      { key: 'q', meta: true, shift: true, action: () => handleFormat('quote'), description: 'Quote' },
      { key: 'c', meta: true, shift: true, action: () => handleFormat('codeblock'), description: 'Code Block' },
      { key: 'f', meta: true, action: () => setShowSearch(true), description: 'Find' },
    ],
    enabled: true,
  });

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    find.setQuery('');
  }, [find]);

  const handleSearchReplace = useCallback((newContent: string) => {
    onChange(newContent);
  }, [onChange]);

  // Auto-adjust view for mobile
  useEffect(() => {
    if (isMobile && activeView === 'split') {
      setActiveView('edit');
    }
  }, [isMobile, activeView]);

  const handleSmartFormat = () => {
    smartFormat();
  };

  const handleToggleTemplates = () => {
    setShowTemplates(!showTemplates);
  };

  const handleViewChange = (view: 'edit' | 'preview' | 'split') => {
    if (isMobile && view === 'split') {
      setActiveView('edit');
      return;
    }
    setActiveView(view);
  };

  const showEdit = activeView === 'edit' || activeView === 'split';
  const showPreview = activeView === 'preview' || activeView === 'split';

  return (
    <div className={cn('flex flex-col h-full bg-background relative', className)}>
      <EditorToolbar
        onSmartFormat={handleSmartFormat}
        isProcessing={isProcessing}
        showTemplates={showTemplates}
        onToggleTemplates={handleToggleTemplates}
        activeView={activeView}
        onViewChange={handleViewChange}
        onFormat={handleFormat}
        onSearch={() => setShowSearch(true)}
      />

      {/* Search Bar */}
      <SearchBar
        isOpen={showSearch}
        onClose={handleCloseSearch}
        find={find}
        onReplace={handleSearchReplace}
      />

      {/* Template Panel */}
      {showTemplates && (
        <TemplatePanel
          visible={showTemplates}
          onInsertTemplate={(template) => {
            const textarea = editorRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue = value.substring(0, start) + template + value.substring(end);
              onChange(newValue);
            } else {
              onChange(value + '\n\n' + template);
            }
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        {showEdit && (
          <div className={cn(
            'border-r border-border bg-background',
            showPreview ? 'w-1/2' : 'w-full'
          )}>
            <EnhancedEditor
              ref={editorRef}
              value={value}
              onChange={onChange}
              className="h-full"
              placeholder="Start writing your markdown..."
            />
          </div>
        )}

        {/* Preview Panel */}
        {showPreview && (
          <div className={cn(
            'bg-background',
            showEdit ? 'w-1/2' : 'w-full'
          )}>
            <Preview content={value} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedEditor;
