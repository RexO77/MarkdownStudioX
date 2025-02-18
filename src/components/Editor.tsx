
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Editor = ({ value, onChange, className }: EditorProps) => {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const htmlContent = convertMarkdownToHtml(value);
    setPreview(htmlContent);
  }, [value]);

  return (
    <div className={cn("w-full h-[calc(100vh-8rem)] grid grid-cols-2", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 md:p-8 bg-background text-foreground border-r border-editor-border
          dark:bg-gray-900 dark:text-gray-100 resize-none focus:outline-none
          font-mono text-sm leading-relaxed transition-colors duration-200"
        placeholder="Enter your Markdown here..."
      />
      <div 
        className="w-full h-full p-4 md:p-8 overflow-auto bg-background dark:bg-gray-900
          prose prose-slate dark:prose-invert max-w-none
          prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6
          prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-5
          prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4
          prose-h4:text-xl prose-h4:font-bold prose-h4:mb-3
          prose-h5:text-lg prose-h5:font-bold prose-h5:mb-2
          prose-h6:text-base prose-h6:font-bold prose-h6:mb-2
          prose-p:text-base prose-p:mb-4 prose-p:leading-7
          prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
          prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 
          prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-4
          prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded prose-pre:mb-4 
          prose-pre:overflow-x-auto dark:prose-pre:bg-gray-800
          prose-code:font-mono prose-code:bg-gray-100 prose-code:px-1 
          prose-code:rounded dark:prose-code:bg-gray-800"
        dangerouslySetInnerHTML={{ __html: preview }}
      />
    </div>
  );
};

export default Editor;
