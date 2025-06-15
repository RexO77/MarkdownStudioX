
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  onPaste: (e: ClipboardEvent) => void;
  onSelectionChange: (selection: { text: string; position: { x: number; y: number }; visible: boolean }) => void;
  className?: string;
}

export const EditorPanel = ({ value, onChange, onPaste, onSelectionChange, className }: EditorPanelProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => onPaste(e);
    const handleSelection = () => {
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      
      if (selectedText.trim().length > 0) {
        const rect = textarea.getBoundingClientRect();
        const position = {
          x: rect.left + (textarea.selectionStart * 8),
          y: rect.top - 10
        };
        
        onSelectionChange({
          text: selectedText,
          position,
          visible: true
        });
      } else {
        onSelectionChange({
          text: '',
          position: { x: 0, y: 0 },
          visible: false
        });
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
  }, [onPaste, onSelectionChange]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("flex flex-col", className)}>
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
  );
};
