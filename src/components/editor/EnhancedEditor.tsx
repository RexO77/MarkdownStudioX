import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useSmartPaste } from './SmartPasteHandler';
import { SmartTextSelection } from './SmartTextSelection';

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: () => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  className?: string;
  placeholder?: string;
  /** Cap the manuscript at a reading measure and centre it — used in focus mode. */
  measured?: boolean;
}

// Helper to get approximate caret position for the selection toolbar
function getCaretPosition(textarea: HTMLTextAreaElement): { x: number; y: number } {
  const { selectionStart, selectionEnd } = textarea;
  const rect = textarea.getBoundingClientRect();
  const style = getComputedStyle(textarea);

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

  const textBeforeSelection = textarea.value.substring(0, selectionStart);
  div.textContent = textBeforeSelection;

  const span = document.createElement('span');
  span.textContent = textarea.value.substring(selectionStart, selectionEnd) || '|';
  div.appendChild(span);

  document.body.appendChild(div);

  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();

  document.body.removeChild(div);

  // x is the selection's midpoint; y is where the bubble's top edge goes.
  // The flip decision lives here because only this function knows the
  // textarea's own top — the bubble clamps against the viewport, nothing else.
  const x = rect.left + (spanRect.left - divRect.left) + span.offsetWidth / 2;
  const lineTop = rect.top + (spanRect.top - divRect.top) - textarea.scrollTop;
  const BUBBLE_CLEARANCE = 38; // ≈ bubble height + gap
  const y = lineTop - BUBBLE_CLEARANCE >= rect.top ? lineTop - BUBBLE_CLEARANCE : lineTop + 29;

  return { x, y };
}

// Line patterns that continue on Enter: bullets, numbered items, task items, quotes
const LIST_PATTERN = /^(\s*)((?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?|>\s+)(.*)$/;

export const EnhancedEditor = forwardRef<HTMLTextAreaElement, EnhancedEditorProps>(
  function EnhancedEditor({ value, onChange, onScroll, onCursorChange, className, placeholder, measured }, ref) {
    const [selection, setSelection] = useState({ text: '', position: { x: 0, y: 0 }, visible: false });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const valueRef = useRef(value);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    valueRef.current = value;

    const { autoCorrectSyntax } = useSmartEditor({
      onContentChange: onChange,
      currentContent: value,
    });

    const { handleSmartPaste } = useSmartPaste({
      onContentChange: onChange,
      currentContent: value,
    });

    const handleSmartPasteRef = useRef(handleSmartPaste);
    handleSmartPasteRef.current = handleSmartPaste;

    const handleCloseSelection = useCallback(() => {
      setSelection((prev) => ({ ...prev, visible: false }));
    }, []);

    const reportCursor = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !onCursorChange) return;
      const upToCaret = textarea.value.substring(0, textarea.selectionStart);
      const lines = upToCaret.split('\n');
      onCursorChange({ line: lines.length, column: lines[lines.length - 1].length + 1 });
    }, [onCursorChange]);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const handlePaste = (e: ClipboardEvent) => handleSmartPasteRef.current(e);

      const handleSelection = () => {
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);

        if (selectedText.trim().length > 0) {
          const position = getCaretPosition(textarea);
          setSelection({ text: selectedText, position, visible: true });
        } else {
          setSelection((prev) => (prev.visible ? { ...prev, visible: false } : prev));
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
    }, []);

    const handleFormat = useCallback(
      (format: string, selectedText?: string) => {
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

        const currentValue = valueRef.current;
        const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
        onChange(newValue);
        setSelection((prev) => ({ ...prev, visible: false }));
      },
      [onChange]
    );

    // Enter continues lists and quotes; Enter on an empty marker exits the list.
    // Tab indents (two spaces) instead of leaving the editor.
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;

        if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const current = valueRef.current;
          if (e.shiftKey) {
            const lineStart = current.lastIndexOf('\n', start - 1) + 1;
            if (current.startsWith('  ', lineStart)) {
              const newValue = current.slice(0, lineStart) + current.slice(lineStart + 2);
              onChange(newValue);
              requestAnimationFrame(() => {
                textarea.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, end - 2));
              });
            }
          } else {
            const newValue = current.substring(0, start) + '  ' + current.substring(end);
            onChange(newValue);
            requestAnimationFrame(() => {
              textarea.setSelectionRange(start + 2, start + 2);
            });
          }
          return;
        }

        if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const start = textarea.selectionStart;
          if (start !== textarea.selectionEnd) return;

          const current = valueRef.current;
          const lineStart = current.lastIndexOf('\n', start - 1) + 1;
          const line = current.substring(lineStart, start);
          const match = line.match(LIST_PATTERN);
          if (!match) return;

          const [, indent, marker, rest] = match;

          e.preventDefault();

          if (!rest.trim()) {
            // Empty item: exit the list
            const newValue = current.substring(0, lineStart) + current.substring(start);
            onChange(newValue);
            requestAnimationFrame(() => {
              textarea.setSelectionRange(lineStart, lineStart);
            });
            return;
          }

          let nextMarker = marker;
          const numbered = marker.match(/^(\d+)\.(\s+)$/);
          if (numbered) {
            nextMarker = `${parseInt(numbered[1], 10) + 1}.${numbered[2]}`;
          }
          // Fresh task items start unchecked
          nextMarker = nextMarker.replace(/\[[xX]\]/, '[ ]');

          const insertion = '\n' + indent + nextMarker;
          const newValue = current.substring(0, start) + insertion + current.substring(start);
          onChange(newValue);
          requestAnimationFrame(() => {
            const pos = start + insertion.length;
            textarea.setSelectionRange(pos, pos);
          });
        }
      },
      [onChange]
    );

    const handleContentChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = autoCorrectSyntax(e.target.value);
        onChange(newContent);
        reportCursor();
      },
      [autoCorrectSyntax, onChange, reportCursor]
    );

    return (
      <div className={cn('relative flex flex-col h-full', className)} data-editor>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onScroll={onScroll}
          onSelect={reportCursor}
          placeholder={placeholder || 'Start writing. The galley typesets as you go.'}
          className={cn(
            'flex-1 w-full resize-none border-0 bg-transparent px-6 py-8',
            measured && 'mx-auto max-w-[41rem]',
            // 16px below md: anything smaller makes iOS Safari zoom the whole
            // layout on focus. The 14px manuscript stands on desktop.
            'manuscript text-base leading-[24px] md:text-[14px]',
            'placeholder:text-muted-foreground/70',
            'focus:outline-none focus:ring-0'
          )}
          spellCheck={false}
        />

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
