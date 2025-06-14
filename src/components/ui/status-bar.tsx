
import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFocusMode } from '@/components/layout/FocusMode';
import { Badge } from '@/components/ui/badge';
import { Wifi, Save, Users, Eye } from 'lucide-react';

interface StatusBarProps {
  className?: string;
  documentStats?: {
    words: number;
    characters: number;
    readingTime: number;
  };
  savingStatus?: 'saved' | 'saving' | 'error';
  onlineUsers?: number;
}

export function StatusBar({ 
  className, 
  documentStats,
  savingStatus = 'saved',
  onlineUsers = 0
}: StatusBarProps) {
  const { user } = useAuth();
  const { mode } = useFocusMode();

  if (mode === 'zen' || mode === 'distraction-free') {
    return null;
  }

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

        {/* Collaboration */}
        {user && onlineUsers > 0 && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{onlineUsers} online</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Focus Mode */}
        <Badge variant="outline" className="text-xs">
          {mode === 'default' ? 'Default' : 
           mode === 'zen' ? 'Zen Mode' : 
           mode === 'distraction-free' ? 'Focus' : 
           'Presentation'}
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

        {/* User Info */}
        {user && (
          <span>
            {user.email}
          </span>
        )}
      </div>
    </div>
  );
}
