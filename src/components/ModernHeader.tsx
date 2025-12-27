
import React from 'react';
import { toast } from 'sonner';
import HeaderLogo from './header/HeaderLogo';
import HeaderActions from './header/HeaderActions';

interface ModernHeaderProps {
  content: string;
  onSave?: () => void;
}

const ModernHeader = ({ content, onSave }: ModernHeaderProps) => {
  const handleSave = () => {
    if (onSave) {
      onSave();
      toast.success('Content saved!', {
        description: 'Your document has been saved locally'
      });
    } else {
      localStorage.setItem('markdown-content', content);
      toast.success('Content saved!');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <HeaderLogo />

        <HeaderActions
          content={content}
          onSave={handleSave}
        />
      </div>
    </header>
  );
};

export default ModernHeader;


