
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bold, Italic, Code, Link2, Type, Sparkles } from 'lucide-react';

interface SmartTextSelectionProps {
  onFormat: (format: string, selection?: string) => void;
  selectedText: string;
  position?: { x: number; y: number };
  visible: boolean;
  onClose?: () => void;
}

export function SmartTextSelection({
  onFormat,
  selectedText,
  position = { x: 0, y: 0 },
  visible,
  onClose
}: SmartTextSelectionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedText && selectedText.length > 3) {
      // Generate smart suggestions based on selected text
      const textSuggestions = [];

      if (/^\d+$/.test(selectedText)) {
        textSuggestions.push('Convert to bold');
      }

      if (selectedText.includes('http')) {
        textSuggestions.push('Convert to link');
      }

      if (selectedText.length > 20) {
        textSuggestions.push('Make heading');
      }

      if (/[A-Z][a-z]+/.test(selectedText)) {
        textSuggestions.push('Add emphasis');
      }

      setSuggestions(textSuggestions);
    }
  }, [selectedText]);

  // Click-outside handler to dismiss toolbar
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    // Delay adding listener to avoid immediate dismissal
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible || !selectedText) return null;

  const formatActions = [
    { icon: Bold, action: 'bold', label: 'Bold', shortcut: '⌘B' },
    { icon: Italic, action: 'italic', label: 'Italic', shortcut: '⌘I' },
    { icon: Code, action: 'code', label: 'Code', shortcut: '⌘K' },
    { icon: Link2, action: 'link', label: 'Link', shortcut: '⌘L' },
    { icon: Type, action: 'heading', label: 'Heading', shortcut: '⌘H' },
    { icon: Sparkles, action: 'ai-improve', label: 'AI Improve', shortcut: '⌘AI' },
  ];

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed z-50 border rounded-lg shadow-xl p-2',
        // Explicit solid background with fallback
        'bg-popover/95 backdrop-blur-sm',
        // Ensure solid background in browsers without backdrop-filter
        'supports-[backdrop-filter]:bg-popover/90',
        'animate-fade-in transform transition-all duration-200'
      )}
      style={{
        left: Math.max(10, position.x - 100),
        top: Math.max(10, position.y - 60),
        // Ensure solid background color as inline style fallback
        backgroundColor: 'hsl(var(--popover))',
      }}
    >
      {/* Selection Info */}
      <div className="text-xs text-muted-foreground mb-2 px-1">
        {selectedText.length} chars selected
      </div>

      {/* Format Actions */}
      <div className="flex items-center gap-1 mb-2">
        {formatActions.map(({ icon: Icon, action, label, shortcut }) => (
          <Button
            key={action}
            variant="ghost"
            size="sm"
            onClick={() => onFormat(action, selectedText)}
            className="h-8 w-8 p-0"
            title={`${label} (${shortcut})`}
          >
            <Icon className="h-3 w-3" />
          </Button>
        ))}
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t pt-2">
          <div className="text-xs text-muted-foreground mb-1">Smart suggestions:</div>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => onFormat('ai-suggestion', selectedText)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

