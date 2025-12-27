
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
  const contentRef = useRef(content);

  // Keep contentRef updated for beforeunload handler
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-content') || '';
    setContent(savedContent);
  }, []);

  // Calculate document statistics
  useEffect(() => {
    // Filter out markdown syntax for more accurate word count
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text only
      .trim();

    const words = plainText ? plainText.split(/\s+/).filter(w => w.length > 0).length : 0;
    const characters = content.length;
    // Show 0 min for empty, otherwise calculate based on 200 wpm
    const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

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

  // Cleanup timeout and add beforeunload handler
  useEffect(() => {
    // Save content before page unload to prevent data loss
    const handleBeforeUnload = () => {
      localStorage.setItem('markdown-content', contentRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final save on unmount
      localStorage.setItem('markdown-content', contentRef.current);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <ModernHeader
        content={content}
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

