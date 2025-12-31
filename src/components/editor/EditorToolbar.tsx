
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Eye, Edit, Moon, Sun, Sparkles, Wand2,
  Bold, Italic, Code, Heading1, List, Quote, Link, Search
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/ui/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditorToolbarProps {
  onSmartFormat: () => void;
  isProcessing: boolean;
  showTemplates: boolean;
  onToggleTemplates: () => void;
  activeView: 'edit' | 'preview' | 'split';
  onViewChange: (view: 'edit' | 'preview' | 'split') => void;
  onFormat?: (format: string) => void;
  onSearch?: () => void;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, shortcut, onClick, disabled }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="h-8 w-8 p-0"
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="flex items-center gap-2">
      <span>{label}</span>
      {shortcut && (
        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
          {shortcut}
        </kbd>
      )}
    </TooltipContent>
  </Tooltip>
);

export const EditorToolbar = ({
  onSmartFormat,
  isProcessing,
  showTemplates,
  onToggleTemplates,
  activeView,
  onViewChange,
  onFormat,
  onSearch
}: EditorToolbarProps) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleFormat = (format: string) => {
    if (onFormat) {
      onFormat(format);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        {/* Formatting Buttons */}
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          label="Bold"
          shortcut="⌘B"
          onClick={() => handleFormat('bold')}
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          label="Italic"
          shortcut="⌘I"
          onClick={() => handleFormat('italic')}
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          label="Inline Code"
          shortcut="⌘`"
          onClick={() => handleFormat('code')}
        />
        <ToolbarButton
          icon={<Heading1 className="h-4 w-4" />}
          label="Heading"
          shortcut="⌘⇧H"
          onClick={() => handleFormat('heading')}
        />
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          label="List"
          shortcut="⌘⇧L"
          onClick={() => handleFormat('list')}
        />
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          label="Quote"
          shortcut="⌘⇧Q"
          onClick={() => handleFormat('quote')}
        />
        <ToolbarButton
          icon={<Link className="h-4 w-4" />}
          label="Link"
          shortcut="⌘K"
          onClick={() => handleFormat('link')}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Search Button */}
        <ToolbarButton
          icon={<Search className="h-4 w-4" />}
          label="Find & Replace"
          shortcut="⌘F"
          onClick={() => onSearch?.()}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* AI & Templates */}
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

        <Separator orientation="vertical" className="h-6 mx-1" />

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
        <ToolbarButton
          icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          onClick={toggleTheme}
        />
      </div>
    </div>
  );
};
