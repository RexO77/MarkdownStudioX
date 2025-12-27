
import React from 'react';
import HeaderLogo from './header/HeaderLogo';
import HeaderActions from './header/HeaderActions';

interface ModernHeaderProps {
  content: string;
}

const ModernHeader = ({ content }: ModernHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <HeaderLogo />

        <HeaderActions content={content} />
      </div>
    </header>
  );
};

export default ModernHeader;



