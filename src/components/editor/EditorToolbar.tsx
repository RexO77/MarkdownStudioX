
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Moon, Sun, Sparkles, Wand2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditorToolbarProps {
  onSmartFormat: () => void;
  isProcessing: boolean;
  showTemplates: boolean;
  onToggleTemplates: () => void;
  activeView: 'edit' | 'preview' | 'split';
  onViewChange: (view: 'edit' | 'preview' | 'split') => void;
}

export const EditorToolbar = ({
  onSmartFormat,
  isProcessing,
  showTemplates,
  onToggleTemplates,
  activeView,
  onViewChange
}: EditorToolbarProps) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSmartFormat}
          disabled={isProcessing}
          className="h-8"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {isProcessing ? 'Formatting...' : 'AI Format'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTemplates}
          className="h-8"
        >
          <Wand2 className="h-4 w-4 mr-1" />
          Templates
        </Button>

        {/* View Toggle */}
        {isMobile ? (
          <div className="flex gap-1">
            <Button
              variant={activeView === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('edit')}
              className="h-8"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant={activeView === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('preview')}
              className="h-8"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(activeView === 'split' ? 'edit' : 'split')}
            className="h-8"
          >
            <Eye className="h-4 w-4 mr-1" />
            {activeView === 'split' ? 'Hide Preview' : 'Show Preview'}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
