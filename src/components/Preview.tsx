import React from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';

interface PreviewProps {
  content: string;
  className?: string;
}

const Preview = ({ content, className }: PreviewProps) => {
  const html = convertMarkdownToHtml(content);

  return (
    <div className={cn("w-full h-full overflow-auto", className)}>
      <div 
        className="prose prose-slate max-w-none p-8 bg-preview-bg dark:prose-invert
          prose-headings:border-b prose-headings:border-gray-200 prose-headings:pb-2
          prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6
          prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
          prose-p:my-4 prose-p:leading-7
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
          prose-pre:overflow-x-auto prose-pre:scrollbar-thin
          prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
          prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
          prose-li:my-2
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
          prose-img:rounded-lg prose-img:shadow-md
          dark:prose-code:bg-gray-800 dark:prose-pre:bg-gray-800
          dark:prose-blockquote:border-gray-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Preview;