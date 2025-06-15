
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Plus } from 'lucide-react';

interface HeaderLogoProps {
  currentDocument?: { title: string } | null;
  onMenuClick?: () => void;
  onNewDocument?: () => void;
  showMenu?: boolean;
}

const HeaderLogo = ({ currentDocument, onMenuClick, onNewDocument, showMenu = false }: HeaderLogoProps) => {
  return (
    <div className="flex items-center gap-3">
      {showMenu && onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-accent transition-all duration-200 hover:scale-105"
          title="Open Documents"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      
      {showMenu && onNewDocument && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewDocument}
          className="hover:bg-accent transition-all duration-200 hover:scale-105"
          title="New Document"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
      
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 shadow-lg transform transition-transform hover:scale-110 hover:shadow-xl">
        <div className="text-white font-bold text-lg tracking-tight">
          X
        </div>
      </div>
      
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
          {currentDocument?.title || 'Markdown Studio X'}
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          {currentDocument ? 'Professional Document Editor' : 'AI-Powered Markdown SaaS Platform'}
        </p>
      </div>
    </div>
  );
};

export default HeaderLogo;
