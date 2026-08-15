import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bold, Italic, Code, Link2, Heading1 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartTextSelectionProps {
  onFormat: (format: string, selection?: string) => void;
  selectedText: string;
  position?: { x: number; y: number };
  visible: boolean;
  onClose?: () => void;
}

const FORMAT_ACTIONS = [
  { icon: Bold, action: 'bold', label: 'Bold (⌘B)' },
  { icon: Italic, action: 'italic', label: 'Italic (⌘I)' },
  { icon: Code, action: 'code', label: 'Code (⌘`)' },
  { icon: Link2, action: 'link', label: 'Link (⌘K)' },
  { icon: Heading1, action: 'heading', label: 'Heading (⌘⇧H)' },
];

export function SmartTextSelection({
  onFormat,
  selectedText,
  position = { x: 0, y: 0 },
  visible,
  onClose,
}: SmartTextSelectionProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Click-outside dismissal
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && selectedText && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-50 flex items-center border border-border bg-popover shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          style={{
            left: Math.max(10, position.x - 80),
            top: Math.max(48, position.y - 44),
          }}
          role="toolbar"
          aria-label="Format selection"
        >
          {FORMAT_ACTIONS.map(({ icon: Icon, action, label }, i) => (
            <button
              key={action}
              type="button"
              onClick={() => onFormat(action, selectedText)}
              title={label}
              aria-label={label}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center text-muted-foreground',
                'hover:bg-foreground hover:text-background',
                i > 0 && 'border-l border-border'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
