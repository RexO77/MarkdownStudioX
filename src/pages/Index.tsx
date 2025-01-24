import React, { useState, useEffect } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import Toolbar from '@/components/Toolbar';
import { getSavedMarkdown } from '@/utils/markdownUtils';

const Index = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedContent = getSavedMarkdown();
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Toolbar content={content} />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
        <Editor
          value={content}
          onChange={setContent}
          className="border-r border-editor-border"
        />
        <Preview content={content} className="hidden md:block" />
      </div>
    </div>
  );
};

export default Index;