
import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from '../ExportMenu';
import { Github, Star, Save } from 'lucide-react';

interface GuestHeaderActionsProps {
  content: string;
  onSave: () => void;
}

const GuestHeaderActions = ({ content, onSave }: GuestHeaderActionsProps) => {
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
        onClick={onSave} 
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
      >
        <Save className="h-4 w-4" />
        <span className="hidden sm:inline">Save</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.href = '/auth'}
        className="ml-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
      >
        Sign In
      </Button>
    </div>
  );
};

export default GuestHeaderActions;
