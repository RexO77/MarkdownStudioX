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
        className="prose max-w-none p-4 bg-preview-bg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Preview;