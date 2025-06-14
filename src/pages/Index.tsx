
import React, { useState, useEffect } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { ThemeProvider } from 'next-themes';

const Index = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    localStorage.setItem('markdown-content', newContent);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <ModernHeader content={content} onFormat={setContent} />
        <div className="flex-1 overflow-hidden">
          <UnifiedEditor
            value={content}
            onChange={handleContentChange}
            className="h-full"
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
