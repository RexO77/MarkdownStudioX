import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';

interface PreviewProps {
  content: string;
  className?: string;
  onChange?: (content: string) => void;
}

const Preview = ({ content, className, onChange }: PreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(content);
  const { theme, setTheme } = useTheme();
  const html = convertMarkdownToHtml(content);

  useEffect(() => {
    setEditableContent(content);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditableContent(newContent);
    onChange?.(newContent);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="sticky top-0 z-10 flex justify-between items-center p-2 border-b border-editor-border dark:border-gray-700 bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm hover:bg-accent transition-colors duration-200"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-accent transition-colors duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editableContent}
            onChange={handleContentChange}
            className="w-full h-full p-4 md:p-8 bg-background text-foreground resize-none focus:outline-none
              dark:bg-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed"
            placeholder="Enter your Markdown here..."
          />
        ) : (
          <div 
            className="prose prose-slate dark:prose-invert max-w-none p-4 md:p-8 bg-background
              prose-headings:border-b prose-headings:border-gray-200 dark:prose-headings:border-gray-700
              prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:pb-4
              prose-h2:text-xl md:prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-3
              prose-h3:text-lg md:prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3 prose-h3:pb-2
              prose-p:my-4 prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 
              prose-code:rounded-md prose-code:text-sm prose-code:text-gray-800 dark:prose-code:text-gray-200
              prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-4 
              prose-pre:rounded-lg prose-pre:overflow-x-auto
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 
              prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 
              dark:prose-blockquote:text-gray-300
              prose-img:rounded-lg prose-img:shadow-md
              prose-strong:text-gray-900 dark:prose-strong:text-gray-100
              prose-em:text-gray-800 dark:prose-em:text-gray-200
              transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
};

export default Preview;