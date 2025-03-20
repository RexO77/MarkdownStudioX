
import React, { useState, useEffect } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import Toolbar from '@/components/Toolbar';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [content, setContent] = useState('');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const isMobile = useIsMobile();

  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const toggleMobileView = () => {
    setMobileView(mobileView === 'edit' ? 'preview' : 'edit');
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
                onClick={toggleMobileView}
                className="flex items-center gap-2 hover:bg-accent transition-all duration-300"
              >
                {mobileView === 'edit' ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <div className={`flex-1 ${isMobile ? 'block' : 'grid grid-cols-2'}`}>
          {(!isMobile || mobileView === 'edit') && (
            <div className={`${isMobile ? 'h-[calc(100vh-8rem)]' : ''}`}>
              <Editor
                value={content}
                onChange={setContent}
                className={isMobile ? '' : 'border-r border-editor-border dark:border-gray-700'}
              />
            </div>
          )}
          {(!isMobile || mobileView === 'preview') && (
            <div className={`${isMobile ? 'h-[calc(100vh-8rem)]' : ''}`}>
              <Preview content={content} />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
