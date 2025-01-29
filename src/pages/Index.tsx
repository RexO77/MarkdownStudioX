import React, { useState, useEffect } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import Toolbar from '@/components/Toolbar';
import { getSavedMarkdown } from '@/utils/markdownUtils';
import { ThemeProvider } from 'next-themes';

const Index = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedContent = getSavedMarkdown();
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Toolbar content={content} onFormat={setContent} />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
          <Editor
            value={content}
            onChange={setContent}
            className="border-r border-editor-border dark:border-gray-700"
          />
          <Preview 
            content={content} 
            onChange={setContent}
            className="hidden lg:block" 
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;