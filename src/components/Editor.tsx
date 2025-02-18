
import React from 'react';
import { cn } from '@/lib/utils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Editor = ({ value, onChange, className }: EditorProps) => {
  return (
    <div className={cn("w-full h-[calc(100vh-8rem)]", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 md:p-8 bg-background text-foreground border-editor-border
          dark:bg-gray-900 dark:text-gray-100 resize-none focus:outline-none
          font-mono text-sm leading-relaxed transition-colors duration-200
          [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mb-6
          [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mb-5
          [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mb-4
          [&>h4]:text-xl [&>h4]:font-bold [&>h4]:mb-3
          [&>h5]:text-lg [&>h5]:font-bold [&>h5]:mb-2
          [&>h6]:text-base [&>h6]:font-bold [&>h6]:mb-2
          [&>p]:mb-4 [&>p]:leading-7
          [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
          [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4
          [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:mb-4
          [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:mb-4 [&>pre]:overflow-x-auto
          [&>code]:font-mono [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:rounded"
        placeholder="Enter your Markdown here..."
      />
    </div>
  );
};

export default Editor;
