
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Menu } from 'lucide-react';

interface HeaderLogoProps {
  currentDocument?: { title: string } | null;
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const HeaderLogo = ({ currentDocument, onMenuClick, showMenu = false }: HeaderLogoProps) => {
  return (
    <div className="flex items-center gap-3">
      {showMenu && onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-accent transition-all duration-200 hover:scale-105"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 transform transition-transform hover:scale-105">
        <FileText className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="hidden sm:block">
        <h1 className="text-lg font-semibold text-foreground transition-colors">
          {currentDocument?.title || 'Markdown Studio'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {currentDocument ? 'Document Editor' : 'Convert & Format with AI'}
        </p>
      </div>
    </div>
  );
};

export default HeaderLogo;
