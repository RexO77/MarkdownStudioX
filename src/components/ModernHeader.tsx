
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { formatContentWithAI, ApiKeyRequiredError } from '@/utils/aiUtils';
import { ApiKeyDialog } from '@/components/ui/api-key-dialog';
import HeaderLogo from './header/HeaderLogo';
import HeaderActions from './header/HeaderActions';

interface ModernHeaderProps {
  content: string;
  onFormat: (formattedContent: string) => void;
  onSave?: () => void;
}

const ModernHeader = ({ content, onFormat, onSave }: ModernHeaderProps) => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const pendingFormatRef = useRef(false);

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

      if (error instanceof ApiKeyRequiredError) {
        toast.error('API key required', {
          description: 'Please set your Groq API key to use AI features',
          action: {
            label: 'Set Key',
            onClick: () => setShowApiKeyDialog(true)
          }
        });
        pendingFormatRef.current = true;
        setShowApiKeyDialog(true);
      } else {
        toast.error('AI formatting failed', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setIsFormatting(false);
    }
  };

  const handleApiKeySet = (hasKey: boolean) => {
    setShowApiKeyDialog(false);
    if (hasKey && pendingFormatRef.current) {
      pendingFormatRef.current = false;
      // Retry formatting after key is set
      setTimeout(handleFormat, 100);
    }
  };

  return (
    <>
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

      {/* API Key Dialog triggered programmatically */}
      {showApiKeyDialog && (
        <ApiKeyDialog
          trigger={<span className="hidden" />}
          onKeySet={handleApiKeySet}
        />
      )}
    </>
  );
};

export default ModernHeader;

