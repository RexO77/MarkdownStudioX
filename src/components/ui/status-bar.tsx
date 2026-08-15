import React from 'react';
import { cn } from '@/lib/utils';
import type { EditorView } from '@/components/UnifiedEditor';

interface StatusBarProps {
  className?: string;
  documentName?: string;
  view?: EditorView;
  cursor?: { line: number; column: number };
  documentStats?: {
    words: number;
    characters: number;
    readingTime: number;
  };
  savingStatus?: 'saved' | 'saving' | 'error';
}

const VIEW_LABEL: Record<EditorView, string> = {
  edit: 'SOURCE',
  split: 'SPLIT',
  read: 'GALLEY',
};

export function StatusBar({
  className,
  documentName,
  view = 'split',
  cursor,
  documentStats,
  savingStatus = 'saved',
}: StatusBarProps) {
  return (
    <div
      className={cn(
        'flex h-[26px] shrink-0 items-stretch justify-between overflow-hidden',
        'border-t border-border bg-background font-mono text-muted-foreground',
        className
      )}
    >
      <div className="flex min-w-0 items-stretch">
        {/* Mode segment: inverse video, the Bell blue block */}
        <span className="statusline-segment bg-primary font-bold text-primary-foreground">
          {VIEW_LABEL[view]}
        </span>

        {documentName && (
          <span className="statusline-segment min-w-0 border-r border-border bg-secondary text-foreground">
            <span className="truncate normal-case">{documentName}</span>
          </span>
        )}
      </div>

      <div className="flex items-stretch">
        {cursor && (
          <span className="statusline-segment hidden border-l border-border sm:inline-flex">
            LN {cursor.line}, COL {cursor.column}
          </span>
        )}

        {documentStats && (
          <>
            <span className="statusline-segment hidden border-l border-border md:inline-flex">
              {documentStats.words} words
            </span>
            <span className="statusline-segment hidden border-l border-border lg:inline-flex">
              {documentStats.characters} chars
            </span>
            <span className="statusline-segment hidden border-l border-border sm:inline-flex">
              {documentStats.readingTime} min read
            </span>
          </>
        )}

        <span
          className={cn(
            'statusline-segment min-w-[13ch] justify-center border-l border-border',
            savingStatus === 'saved' && 'text-muted-foreground',
            savingStatus === 'saving' && 'text-primary',
            savingStatus === 'error' && 'text-destructive'
          )}
          role="status"
        >
          {savingStatus === 'saving' ? 'saving…' : savingStatus === 'saved' ? 'saved' : 'save failed'}
        </span>
      </div>
    </div>
  );
}
