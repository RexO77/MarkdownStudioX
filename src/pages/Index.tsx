
import React, { useState, useEffect, useRef } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { StatusBar } from '@/components/ui/status-bar';

const Index = () => {
  const [content, setContent] = useState('');
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-content') || '';
    setContent(savedContent);
  }, []);

  // Calculate document statistics
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    setDocumentStats({ words, characters, readingTime });
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save to localStorage after short delay
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('markdown-content', newContent);
    }, 500);
  };

  const handleSave = () => {
    localStorage.setItem('markdown-content', content);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <ModernHeader
        content={content}
        onFormat={setContent}
        onSave={handleSave}
      />

      <div className="flex-1">
        <UnifiedEditor
          value={content}
          onChange={handleContentChange}
          className="h-full"
        />
      </div>

      <StatusBar
        documentStats={documentStats}
        savingStatus="saved"
      />
    </div>
  );
};

export default Index;
