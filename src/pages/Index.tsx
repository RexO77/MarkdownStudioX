
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <ModernHeader content={content} onFormat={setContent} />
        <main className="flex-1 overflow-hidden">
          <UnifiedEditor
            value={content}
            onChange={handleContentChange}
            className="h-full"
          />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
