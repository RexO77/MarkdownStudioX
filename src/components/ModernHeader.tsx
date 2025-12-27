
import React, { useState } from 'react';
import { toast } from 'sonner';
import { formatContentWithAI } from '@/utils/aiUtils';
import HeaderLogo from './header/HeaderLogo';
import HeaderActions from './header/HeaderActions';

interface ModernHeaderProps {
  content: string;
  onFormat: (formattedContent: string) => void;
  onSave?: () => void;
}

const ModernHeader = ({ content, onFormat, onSave }: ModernHeaderProps) => {
  const [isFormatting, setIsFormatting] = useState(false);

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

  const handleFormat = async () => {
    if (!content.trim()) {
      toast.error('No content to format');
      return;
    }

    setIsFormatting(true);
    try {
      const formatted = await formatContentWithAI(content);
      onFormat(formatted);
      toast.success('Content formatted successfully!');
    } catch (error) {
      console.error('Format error:', error);
      toast.error('AI formatting failed');
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <HeaderLogo />

        <HeaderActions
          content={content}
          onSave={handleSave}
          onFormat={handleFormat}
          isFormatting={isFormatting}
        />
      </div>
    </header>
  );
};

export default ModernHeader;
