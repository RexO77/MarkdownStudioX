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
        className="w-full h-full p-4 bg-editor-bg text-editor-text border-editor-border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your Markdown here..."
      />
    </div>
  );
};

export default Editor;