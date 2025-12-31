
import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useSmartPaste } from './SmartPasteHandler';
import { SmartTextSelection } from './SmartTextSelection';

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

// Helper to get approximate caret position
function getCaretPosition(textarea: HTMLTextAreaElement): { x: number; y: number } {
  const { selectionStart, selectionEnd } = textarea;
  const rect = textarea.getBoundingClientRect();
  const style = getComputedStyle(textarea);

  // Create a hidden div to mirror textarea content
  const div = document.createElement('div');
  div.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    font: ${style.font};
    padding: ${style.padding};
    width: ${textarea.clientWidth}px;
    line-height: ${style.lineHeight};
  `;

  // Get text before selection
  const textBeforeSelection = textarea.value.substring(0, selectionStart);
  div.textContent = textBeforeSelection;

  // Add a span to mark the caret position
  const span = document.createElement('span');
  span.textContent = textarea.value.substring(selectionStart, selectionEnd) || '|';
  div.appendChild(span);

  document.body.appendChild(div);

  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();

  document.body.removeChild(div);

  // Calculate position relative to viewport
  const x = rect.left + (spanRect.left - divRect.left) + span.offsetWidth / 2;
  const y = rect.top + (spanRect.top - divRect.top) - 10;

  return {
    x: Math.max(100, Math.min(window.innerWidth - 200, x)),
    y: Math.max(60, y)
  };
}

export const EnhancedEditor = forwardRef<HTMLTextAreaElement, EnhancedEditorProps>(
  function EnhancedEditor({ value, onChange, className, placeholder }, ref) {
    const [selection, setSelection] = useState({ text: '', position: { x: 0, y: 0 }, visible: false });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const valueRef = useRef(value);

    // Forward the ref to parent
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    // Keep value ref updated for use in callbacks
    valueRef.current = value;

    const { autoCorrectSyntax } = useSmartEditor({
      onContentChange: onChange,
      currentContent: value
    });

    const { handleSmartPaste } = useSmartPaste({
      onContentChange: onChange,
      currentContent: value
    });

    // Use refs for stable function references to avoid memory leaks
    const handleSmartPasteRef = useRef(handleSmartPaste);
    handleSmartPasteRef.current = handleSmartPaste;

    const handleCloseSelection = useCallback(() => {
      setSelection(prev => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const handlePaste = (e: ClipboardEvent) => handleSmartPasteRef.current(e);

      const handleSelection = () => {
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);

        if (selectedText.trim().length > 0) {
          const position = getCaretPosition(textarea);

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
    }, []); // Empty deps - only mount/unmount

    const handleFormat = useCallback((format: string, selectedText?: string) => {
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

      const currentValue = valueRef.current;
      const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
      onChange(newValue);
      setSelection(prev => ({ ...prev, visible: false }));
    }, [onChange]);

    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = autoCorrectSyntax(e.target.value);
      onChange(newContent);
    }, [autoCorrectSyntax, onChange]);

    return (
      <div className={cn('relative flex flex-col h-full', className)} data-editor>
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
          onClose={handleCloseSelection}
        />
      </div>
    );
  }
);
