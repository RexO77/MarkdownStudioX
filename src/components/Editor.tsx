import React from 'react';
import { cn } from '@/lib/utils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Editor = ({ value, onChange, className }: EditorProps) => {
  return (
    <div className={cn("w-full h-full", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-8 bg-background text-foreground border-editor-border
          dark:bg-gray-900 dark:text-gray-100 resize-none focus:outline-none
          font-mono text-sm leading-relaxed transition-colors duration-200"
        placeholder="Enter your Markdown here..."
      />
    </div>
  );
};

export default Editor;