
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useSmartPaste } from '@/components/editor/SmartPasteHandler';
import { SmartTextSelection } from '@/components/editor/SmartTextSelection';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { TemplatePanel } from '@/components/editor/TemplatePanel';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UnifiedEditor = ({ value, onChange, className }: UnifiedEditorProps) => {
  const [preview, setPreview] = useState('');
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selection, setSelection] = useState({ text: '', position: { x: 0, y: 0 }, visible: false });
  const isMobile = useIsMobile();

  const { smartFormat, autoCorrectSyntax, insertTemplate, isProcessing } = useSmartEditor({
    onContentChange: onChange,
    currentContent: value
  });
  
  const { handleSmartPaste } = useSmartPaste({
    onContentChange: onChange,
    currentContent: value
  });

  useEffect(() => {
    const htmlContent = convertMarkdownToHtml(value);
    setPreview(htmlContent);
  }, [value]);

  useEffect(() => {
    if (isMobile) {
      setActiveView('edit');
    } else {
      setActiveView('split');
    }
  }, [isMobile]);

  const handleFormat = (format: string, selectedText?: string) => {
    // Format selected text logic
    const formattedText = selectedText || '';
    
    let newFormattedText = '';
    
    switch (format) {
      case 'bold':
        newFormattedText = `**${formattedText}**`;
        break;
      case 'italic':
        newFormattedText = `*${formattedText}*`;
        break;
      case 'code':
        newFormattedText = `\`${formattedText}\``;
        break;
      case 'link':
        newFormattedText = `[${formattedText}](url)`;
        break;
      case 'heading':
        newFormattedText = `# ${formattedText}`;
        break;
      default:
        newFormattedText = formattedText;
    }

    // Apply formatting to the content
    const newValue = value.replace(selectedText || '', newFormattedText);
    onChange(newValue);
    setSelection(prev => ({ ...prev, visible: false }));
  };

  const handleContentChange = (newContent: string) => {
    const correctedContent = autoCorrectSyntax(newContent);
    onChange(correctedContent);
  };

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      <EditorToolbar
        onSmartFormat={smartFormat}
        isProcessing={isProcessing}
        showTemplates={showTemplates}
        onToggleTemplates={() => setShowTemplates(!showTemplates)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <TemplatePanel
        visible={showTemplates}
        onInsertTemplate={insertTemplate}
        onClose={() => setShowTemplates(false)}
      />

      {/* Editor Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor Panel */}
        {(activeView === 'edit' || activeView === 'split') && (
          <EditorPanel
            value={value}
            onChange={handleContentChange}
            onPaste={handleSmartPaste}
            onSelectionChange={setSelection}
            className={cn(
              isMobile ? "w-full" : activeView === 'split' ? "w-1/2 border-r" : "w-full"
            )}
          />
        )}

        {/* Preview Panel */}
        {(activeView === 'preview' || activeView === 'split') && (
          <PreviewPanel
            content={preview}
            className={cn(
              isMobile ? "w-full" : "w-1/2"
            )}
          />
        )}
      </div>

      {/* Smart Text Selection Toolbar */}
      <SmartTextSelection
        visible={selection.visible}
        selectedText={selection.text}
        position={selection.position}
        onFormat={handleFormat}
      />
    </div>
  );
};

export default UnifiedEditor;
