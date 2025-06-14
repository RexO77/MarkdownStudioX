
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Link, Code, List, Quote, Heading1, Heading2 } from 'lucide-react';

interface FloatingToolbarProps {
  onFormat: (format: string) => void;
  visible?: boolean;
  position?: { x: number; y: number };
}

export function FloatingToolbar({ onFormat, visible = false, position }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const formatActions = [
    { icon: Bold, action: 'bold', label: 'Bold' },
    { icon: Italic, action: 'italic', label: 'Italic' },
    { icon: Code, action: 'code', label: 'Code' },
    { icon: Link, action: 'link', label: 'Link' },
    { icon: Heading1, action: 'h1', label: 'Heading 1' },
    { icon: Heading2, action: 'h2', label: 'Heading 2' },
    { icon: List, action: 'list', label: 'List' },
    { icon: Quote, action: 'quote', label: 'Quote' },
  ];

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed z-50 flex items-center gap-1 p-2 bg-popover border rounded-lg shadow-lg',
        'transform transition-all duration-200 ease-out',
        visible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
      )}
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
      }}
    >
      {formatActions.map(({ icon: Icon, action, label }) => (
        <Button
          key={action}
          variant="ghost"
          size="sm"
          onClick={() => onFormat(action)}
          className="h-8 w-8 p-0"
          title={label}
        >
          <Icon className="h-3 w-3" />
        </Button>
      ))}
    </div>
  );
}
