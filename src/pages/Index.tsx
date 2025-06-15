
import React, { useState, useEffect, useRef } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { StatusBar } from '@/components/ui/status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { SignInExperienceDialog } from '@/components/SignInExperienceDialog';

const IndexContent = () => {
  const { user, loading } = useAuth();
  const { 
    currentDocument, 
    saveCurrentDocument, 
    autoCreateDocument,
    clearCurrentDocument 
  } = useDocuments();
  
  const [content, setContent] = useState('');
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContent = useRef<string>('');
  const isLoadingDocument = useRef(false);

  // Load content when current document changes
  useEffect(() => {
    if (currentDocument && !isLoadingDocument.current) {
      isLoadingDocument.current = true;
      console.log('Loading content from current document:', currentDocument.title);
      console.log('Document content:', currentDocument.content || 'empty');
      
      const docContent = currentDocument.content || '';
      setContent(docContent);
      lastSavedContent.current = docContent;
      
      setTimeout(() => {
        isLoadingDocument.current = false;
      }, 100);
    } else if (!user && !currentDocument) {
      // Load from localStorage for guests
      const savedContent = localStorage.getItem('markdown-content') || '';
      console.log('Loading content from localStorage:', savedContent.length);
      setContent(savedContent);
      lastSavedContent.current = savedContent;
    } else if (user && !currentDocument) {
      // Clear content when logged in but no document selected
      console.log('No current document, clearing content');
      setContent('');
      lastSavedContent.current = '';
    }
  }, [currentDocument, user]);

  // Calculate document statistics
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    setDocumentStats({ words, characters, readingTime });
  }, [content]);

  const handleContentChange = async (newContent: string) => {
    if (isLoadingDocument.current) {
      console.log('Skipping content change - document is loading');
      return;
    }

    console.log('Content changed, length:', newContent.length);
    setContent(newContent);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // For guests, save to localStorage immediately
    if (!user) {
      localStorage.setItem('markdown-content', newContent);
      return;
    }

    // For authenticated users, auto-save after delay
    if (newContent !== lastSavedContent.current) {
      console.log('Scheduling auto-save in 2 seconds');
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (currentDocument) {
            await saveCurrentDocument(currentDocument.title, newContent, false);
          } else if (newContent.trim().length > 10) {
            console.log('Auto-creating document for new content');
            await autoCreateDocument(newContent);
          }
          lastSavedContent.current = newContent;
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000);
    }
  };

  // Create new document
  const handleNewDocument = () => {
    clearCurrentDocument();
    setContent('');
    lastSavedContent.current = '';
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
      
      <ModernHeader 
        content={content} 
        onFormat={setContent}
        onNewDocument={handleNewDocument}
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
        onlineUsers={user ? 1 : 0}
      />
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
