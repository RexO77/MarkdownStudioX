
import React from 'react';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  content: string;
  className?: string;
}

export const PreviewPanel = ({ content, className }: PreviewPanelProps) => {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex-1 overflow-auto bg-card/30">
        <div 
          className="prose prose-slate dark:prose-invert max-w-none p-6
            prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:text-foreground
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-foreground
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:text-foreground
            prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:bg-muted prose-code:px-2 prose-code:py-1 
            prose-code:rounded-md prose-code:text-sm prose-code:text-foreground
            prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 
            prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:border
            prose-ul:text-foreground prose-ol:text-foreground
            prose-li:text-foreground prose-li:marker:text-muted-foreground
            prose-blockquote:border-l-4 prose-blockquote:border-primary 
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
            prose-strong:text-foreground prose-em:text-foreground
            prose-hr:border-border
            transition-colors duration-200"
          dangerouslySetInnerHTML={{ 
            __html: content || '<p class="text-muted-foreground italic">Your preview will appear here...</p>' 
          }}
        />
      </div>
    </div>
  );
};
