
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Moon, Sun, Sparkles, Wand2, Lock } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { AIFeatureTooltip } from '@/components/auth/AIFeatureGate';
import { toast } from 'sonner';

interface RestrictedEditorToolbarProps {
  onSmartFormat: () => void;
  isProcessing: boolean;
  showTemplates: boolean;
  onToggleTemplates: () => void;
  activeView: 'edit' | 'preview' | 'split';
  onViewChange: (view: 'edit' | 'preview' | 'split') => void;
}

export const RestrictedEditorToolbar = ({
  onSmartFormat,
  isProcessing,
  showTemplates,
  onToggleTemplates,
  activeView,
  onViewChange
}: RestrictedEditorToolbarProps) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleAIFeatureClick = (featureName: string) => {
    if (!user) {
      toast.error(`${featureName} requires sign in`, {
        description: 'Sign in for free to access AI features',
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/auth'
        }
      });
      return;
    }
    
    if (featureName === 'AI Format') {
      onSmartFormat();
    } else if (featureName === 'Templates') {
      onToggleTemplates();
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIFeatureClick('AI Format')}
            disabled={isProcessing}
            className={`h-8 ${!user ? 'text-muted-foreground' : ''}`}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isProcessing ? 'Formatting...' : 'AI Format'}
            {!user && <Lock className="h-3 w-3 ml-1" />}
          </Button>
          <AIFeatureTooltip feature="AI Format" />
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIFeatureClick('Templates')}
            className={`h-8 ${!user ? 'text-muted-foreground' : ''}`}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Templates
            {!user && <Lock className="h-3 w-3 ml-1" />}
          </Button>
          <AIFeatureTooltip feature="Templates" />
        </div>

        {/* View Toggle - Available for all users */}
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

        {!user && (
          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary font-medium">
              Sign in for AI features
            </span>
          </div>
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
