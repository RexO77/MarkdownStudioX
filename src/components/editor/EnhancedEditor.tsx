
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useSmartPaste } from './SmartPasteHandler';
import { SmartTextSelection } from './SmartTextSelection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Table, Code, List, Quote } from 'lucide-react';

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function EnhancedEditor({ value, onChange, className, placeholder }: EnhancedEditorProps) {
  const [selection, setSelection] = useState({ text: '', position: { x: 0, y: 0 }, visible: false });
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { smartFormat, autoCorrectSyntax, insertTemplate, isProcessing } = useSmartEditor({
    onContentChange: onChange,
    currentContent: value
  });
  
  const { handleSmartPaste } = useSmartPaste({
    onContentChange: onChange,
    currentContent: value
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => handleSmartPaste(e);
    const handleSelection = () => {
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      
      if (selectedText.trim().length > 0) {
        const rect = textarea.getBoundingClientRect();
        const position = {
          x: rect.left + (textarea.selectionStart * 8), // Approximate character width
          y: rect.top - 10
        };
        
        setSelection({
          text: selectedText,
          position,
          visible: true
        });
      } else {
        setSelection(prev => ({ ...prev, visible: false }));
      }
    };

    textarea.addEventListener('paste', handlePaste);
    textarea.addEventListener('mouseup', handleSelection);
    textarea.addEventListener('keyup', handleSelection);

    return () => {
      textarea.removeEventListener('paste', handlePaste);
      textarea.removeEventListener('mouseup', handleSelection);
      textarea.removeEventListener('keyup', handleSelection);
    };
  }, [handleSmartPaste]);

  const handleFormat = (format: string, selectedText?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedText || textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `*${text}*`;
        break;
      case 'code':
        formattedText = `\`${text}\``;
        break;
      case 'link':
        formattedText = `[${text}](url)`;
        break;
      case 'heading':
        formattedText = `# ${text}`;
        break;
      case 'ai-improve':
        // This would call AI to improve the selected text
        formattedText = text; // Placeholder
        break;
      default:
        formattedText = text;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    setSelection(prev => ({ ...prev, visible: false }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = autoCorrectSyntax(e.target.value);
    onChange(newContent);
  };

  const templates = [
    { icon: Table, name: 'table', label: 'Table' },
    { icon: Code, name: 'codeblock', label: 'Code Block' },
    { icon: List, name: 'checklist', label: 'Checklist' },
    { icon: Quote, name: 'quote', label: 'Quote' },
    { icon: Sparkles, name: 'note', label: 'Note' },
    { icon: Wand2, name: 'mermaid', label: 'Diagram' },
  ];

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Smart Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={smartFormat}
            disabled={isProcessing}
            className="h-8"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isProcessing ? 'Formatting...' : 'AI Format'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-8"
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Templates
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {value.split(' ').filter(w => w.length > 0).length} words
          </Badge>
          <Badge variant="outline" className="text-xs">
            {value.length} chars
          </Badge>
        </div>
      </div>

      {/* Template Quick Access */}
      {showTemplates && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
          {templates.map(({ icon: Icon, name, label }) => (
            <Button
              key={name}
              variant="ghost"
              size="sm"
              onClick={() => {
                insertTemplate(name);
                setShowTemplates(false);
              }}
              className="h-8 text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleContentChange}
        placeholder={placeholder || "Start writing your markdown..."}
        className={cn(
          'flex-1 w-full resize-none border-0 bg-transparent px-4 py-4',
          'text-sm leading-relaxed',
          'focus:outline-none focus:ring-0',
          'font-mono'
        )}
        spellCheck={false}
      />

      {/* Smart Text Selection Toolbar */}
      <SmartTextSelection
        visible={selection.visible}
        selectedText={selection.text}
        position={selection.position}
        onFormat={handleFormat}
      />
    </div>
  );
}
