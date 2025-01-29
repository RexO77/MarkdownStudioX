import React, { useState, useEffect } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import Toolbar from '@/components/Toolbar';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <div className="sticky top-0 z-10 bg-background border-b border-editor-border">
          <Toolbar content={content} onFormat={setContent} />
          {isMobile && (
            <div className="p-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePreview}
                className="flex items-center gap-2 hover:bg-accent transition-all duration-300"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Preview
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <div className={`flex-1 grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-0`}>
          <div className={`${isMobile && showPreview ? 'hidden' : 'block'}`}>
            <Editor
              value={content}
              onChange={setContent}
              className="border-r border-editor-border dark:border-gray-700"
            />
          </div>
          <div 
            className={`
              ${isMobile ? (showPreview ? 'block' : 'hidden') : 'hidden lg:block'}
              h-[calc(100vh-8rem)] overflow-auto
            `}
          >
            <Preview 
              content={content} 
              onChange={setContent}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;