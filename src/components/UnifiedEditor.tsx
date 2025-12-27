
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Preview from './Preview';
import { EditorToolbar } from './editor/EditorToolbar';
import { EnhancedEditor } from './editor/EnhancedEditor';
import { TemplatePanel } from './editor/TemplatePanel';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UnifiedEditor = ({ value, onChange, className }: UnifiedEditorProps) => {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split');
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { smartFormat, isProcessing } = useSmartEditor({
    onContentChange: onChange,
    currentContent: value
  });

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
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <EditorToolbar
        onSmartFormat={handleSmartFormat}
        isProcessing={isProcessing}
        showTemplates={showTemplates}
        onToggleTemplates={handleToggleTemplates}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Template Panel */}
      {showTemplates && (
        <TemplatePanel
          visible={showTemplates}
          onInsertTemplate={(template) => {
            const textarea = textareaRef.current;
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
