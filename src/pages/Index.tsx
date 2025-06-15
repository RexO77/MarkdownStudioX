
import React, { useState, useEffect, useRef } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { StatusBar } from '@/components/ui/status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { SignInExperienceDialog } from '@/components/SignInExperienceDialog';

const IndexContent = () => {
  const { user, loading } = useAuth();
  const { currentDocument, updateDocument, autoCreateDocument } = useDocuments();
  const [content, setContent] = useState('');
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0
  });
  const autoCreateTriggered = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentDocument) {
      console.log('Setting content from current document:', currentDocument.title);
      setContent(currentDocument.content);
      autoCreateTriggered.current = false;
    } else if (!user) {
      const savedContent = localStorage.getItem('markdown-content');
      if (savedContent) {
        console.log('Loading content from localStorage');
        setContent(savedContent);
      }
      autoCreateTriggered.current = false;
    } else {
      console.log('No current document, clearing content');
      setContent('');
      autoCreateTriggered.current = false;
    }
  }, [currentDocument, user]);

  // Calculate document statistics
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute

    setDocumentStats({ words, characters, readingTime });
  }, [content]);

  const handleContentChange = async (newContent: string) => {
    console.log('Content changed, length:', newContent.length);
    setContent(newContent);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (user && currentDocument) {
      console.log('Auto-saving current document after 1 second delay');
      saveTimeoutRef.current = setTimeout(() => {
        updateDocument(currentDocument.id, currentDocument.title, newContent, false);
      }, 1000);
    } else if (user && !currentDocument && !autoCreateTriggered.current && newContent.trim().length > 10) {
      console.log('Auto-creating new document');
      autoCreateTriggered.current = true;
      try {
        await autoCreateDocument(newContent);
      } catch (error) {
        console.error('Auto-create document failed:', error);
        autoCreateTriggered.current = false;
      }
    } else if (!user) {
      localStorage.setItem('markdown-content', newContent);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {!user && <SignInExperienceDialog />}
      
      <ModernHeader content={content} onFormat={setContent} />
      
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
        onlineUsers={user ? 1 : 0}
      />
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
