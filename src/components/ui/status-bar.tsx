
import React from 'react';
import { cn } from '@/lib/utils';
import { useFocusMode } from '@/components/layout/FocusMode';
import { Badge } from '@/components/ui/badge';
import { Wifi, Save, Eye } from 'lucide-react';

interface StatusBarProps {
  className?: string;
  documentStats?: {
    words: number;
    characters: number;
    readingTime: number;
  };
  savingStatus?: 'saved' | 'saving' | 'error';
}

export function StatusBar({
  className,
  documentStats,
  savingStatus = 'saved'
}: StatusBarProps) {
  const { mode } = useFocusMode();

  if (mode === 'zen' || mode === 'distraction-free') {
    return null;
  }

  const getFocusModeLabel = (mode: string) => {
    switch (mode) {
      case 'zen':
        return 'Zen Mode';
      case 'distraction-free':
        return 'Focus';
      case 'presentation':
        return 'Presentation';
      default:
        return 'Default';
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2 border-t bg-background/80 backdrop-blur-sm text-xs text-muted-foreground',
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Save Status */}
        <div className="flex items-center gap-1">
          <Save className={cn(
            'h-3 w-3',
            savingStatus === 'saving' && 'animate-spin',
            savingStatus === 'saved' && 'text-green-500',
            savingStatus === 'error' && 'text-red-500'
          )} />
          <span className={cn(
            savingStatus === 'saved' && 'text-green-500',
            savingStatus === 'error' && 'text-red-500'
          )}>
            {savingStatus === 'saving' ? 'Saving...' :
              savingStatus === 'saved' ? 'Saved' : 'Error saving'}
          </span>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3 text-green-500" />
          <span>Online</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Focus Mode */}
        <Badge variant="outline" className="text-xs">
          {getFocusModeLabel(mode)}
        </Badge>

        {/* Document Stats */}
        {documentStats && (
          <div className="flex items-center gap-4">
            <span>{documentStats.words} words</span>
            <span>{documentStats.characters} chars</span>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{documentStats.readingTime}m read</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
