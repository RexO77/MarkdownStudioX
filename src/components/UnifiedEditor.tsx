
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useSmartPaste } from '@/components/editor/SmartPasteHandler';
import { SmartTextSelection } from '@/components/editor/SmartTextSelection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Moon, Sun, Sparkles, Wand2, Table, Code, List, Quote } from 'lucide-react';
import { useTheme } from 'next-themes';
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
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate accurate word count
  const wordCount = value.trim() ? value.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = value.length;

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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => handleSmartPaste(e);
    const handleSelection = () => {
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      
      if (selectedText.trim().length > 0) {
        const rect = textarea.getBoundingClientRect();
        const position = {
          x: rect.left + (textarea.selectionStart * 8),
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
    <div className={cn("h-full flex flex-col bg-background", className)}>
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

          {/* View Toggle */}
          {isMobile ? (
            <div className="flex gap-1">
              <Button
                variant={activeView === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('edit')}
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant={activeView === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('preview')}
                className="h-8"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView(activeView === 'split' ? 'edit' : 'split')}
              className="h-8"
            >
              <Eye className="h-4 w-4 mr-1" />
              {activeView === 'split' ? 'Hide Preview' : 'Show Preview'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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

      {/* Editor Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor Panel */}
        {(activeView === 'edit' || activeView === 'split') && (
          <div className={cn(
            "flex flex-col",
            isMobile ? "w-full" : activeView === 'split' ? "w-1/2 border-r" : "w-full"
          )}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleContentChange}
              className="flex-1 w-full p-6 bg-background text-foreground resize-none focus:outline-none
                font-mono text-sm leading-relaxed transition-colors duration-200
                placeholder:text-muted-foreground border-0 outline-none"
              placeholder="# Start writing your Markdown here...

Try some examples:
- **Bold text**
- *Italic text*
- `Code snippet`
- [Link](https://example.com)

## Code Block
```javascript
console.log('Hello, World!');
```

> This is a blockquote

1. Numbered list
2. Another item

Or try pasting URLs, code, or other content for smart formatting!"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(activeView === 'preview' || activeView === 'split') && (
          <div className={cn(
            "flex flex-col",
            isMobile ? "w-full" : "w-1/2"
          )}>
            <div className="flex-1 overflow-auto bg-card/30">
              <div 
                className="prose prose-slate dark:prose-invert max-w-none p-6
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:text-foreground
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-foreground
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:text-foreground
                  prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted prose-code:px-2 prose-code:py-1 
                  prose-code:rounded-md prose-code:text-sm prose-code:text-foreground
                  prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 
                  prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:border
                  prose-ul:text-foreground prose-ol:text-foreground
                  prose-li:text-foreground prose-li:marker:text-muted-foreground
                  prose-blockquote:border-l-4 prose-blockquote:border-primary 
                  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-strong:text-foreground prose-em:text-foreground
                  prose-hr:border-border
                  transition-colors duration-200"
                dangerouslySetInnerHTML={{ __html: preview || '<p class="text-muted-foreground italic">Your preview will appear here...</p>' }}
              />
            </div>
          </div>
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
