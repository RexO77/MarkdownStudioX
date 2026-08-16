import React from 'react';
import { cn } from '@/lib/utils';
import { BAR, HOVER } from '@/components/chrome';
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
  onOpenCommands?: () => void;
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
  onOpenCommands,
}: StatusBarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-stretch justify-between overflow-hidden',
        BAR.status,
        'border-t border-border bg-background font-mono text-muted-foreground',
        className
      )}
    >
      <div className="flex min-w-0 items-stretch">
        {/* Mode segment: inverse video, the Bell blue block */}
        <span className="statusline-segment bg-primary font-bold text-primary-foreground">
          <span className="cap-center">{VIEW_LABEL[view]}</span>
        </span>

        {/* The name lives in the header at md+; below that the footer carries it */}
        {documentName && (
          <span className="statusline-segment min-w-0 border-r border-border bg-secondary text-foreground md:hidden">
            <span className="cap-center truncate normal-case">{documentName}</span>
          </span>
        )}

        {/* The commands affordance the header used to only hint at */}
        {onOpenCommands && (
          <button
            type="button"
            onClick={onOpenCommands}
            aria-label="Open command palette (⌘P)"
            className={cn('statusline-segment border-r border-border', HOVER)}
          >
            <span className="cap-center font-bold text-primary" aria-hidden="true">
              :
            </span>
            <span className="cap-center">Commands</span>
            <span className="cap-center hidden text-muted-foreground/70 sm:inline">⌘P</span>
          </button>
        )}
      </div>

      <div className="flex items-stretch">
        {cursor && (
          <span className="statusline-segment hidden border-l border-border sm:inline-flex">
            <span className="cap-center">
              LN {cursor.line}, COL {cursor.column}
            </span>
          </span>
        )}

        {documentStats && (
          <>
            <span className="statusline-segment hidden border-l border-border md:inline-flex">
              <span className="cap-center">{documentStats.words} words</span>
            </span>
            <span className="statusline-segment hidden border-l border-border lg:inline-flex">
              <span className="cap-center">{documentStats.characters} chars</span>
            </span>
            <span className="statusline-segment hidden border-l border-border sm:inline-flex">
              <span className="cap-center">{documentStats.readingTime} min read</span>
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
          <span className="cap-center normal-case">
            {savingStatus === 'saving' ? 'saving…' : savingStatus === 'saved' ? 'saved' : 'save failed'}
          </span>
        </span>
      </div>
    </div>
  );
}
