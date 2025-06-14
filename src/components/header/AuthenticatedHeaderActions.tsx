
import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from '../ExportMenu';
import { Github, Star, Clock, Save, Sparkles, LogOut, Loader2 } from 'lucide-react';

interface AuthenticatedHeaderActionsProps {
  content: string;
  onSave: () => void;
  onShowVersions: () => void;
  onFormat: () => void;
  onSignOut: () => void;
  saving: boolean;
  isFormatting: boolean;
  isLoadingHistory: boolean;
}

const AuthenticatedHeaderActions = ({
  content,
  onSave,
  onShowVersions,
  onFormat,
  onSignOut,
  saving,
  isFormatting,
  isLoadingHistory
}: AuthenticatedHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <ExportMenu content={content} />
      
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
        onClick={() => window.open('https://github.com/RexO77/MarkdowntoTextconverter', '_blank')}
      >
        <Github className="h-4 w-4" />
        <Star className="h-4 w-4" />
        <span className="hidden md:inline">Star</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onShowVersions}
        disabled={isLoadingHistory}
        className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105 disabled:opacity-50"
      >
        {isLoadingHistory ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isLoadingHistory ? 'Loading...' : 'History'}
        </span>
      </Button>
      
      <Button 
        onClick={onSave} 
        disabled={saving}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {saving ? 'Saving...' : 'Save'}
        </span>
      </Button>
      
      <Button
        onClick={onFormat}
        disabled={isFormatting}
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 disabled:opacity-50"
      >
        {isFormatting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isFormatting ? 'Formatting...' : 'Format AI'}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onSignOut}
        className="hover:bg-accent transition-all duration-200 hover:scale-105"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AuthenticatedHeaderActions;
