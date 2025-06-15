
import React from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/components/ui/theme-provider';

interface PreviewProps {
  content: string;
  className?: string;
}

const Preview = ({ content, className }: PreviewProps) => {
  const { theme, setTheme } = useTheme();
  const html = convertMarkdownToHtml(content);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="sticky top-0 z-10 flex justify-end items-center p-2 border-b border-editor-border dark:border-gray-700 bg-background">
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
        <div 
          className="prose prose-slate dark:prose-invert max-w-none p-4 md:p-8 bg-background
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:border-b prose-h1:pb-2
            prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-5 prose-h2:border-b prose-h2:pb-2
            prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4
            prose-h4:text-xl prose-h4:font-bold prose-h4:mb-3
            prose-h5:text-lg prose-h5:font-bold prose-h5:mb-2
            prose-h6:text-base prose-h6:font-bold prose-h6:mb-2
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
      </div>
    </div>
  );
};

export default Preview;
