
import React, { useState, useEffect, useRef } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { SignInExperienceDialog } from '@/components/SignInExperienceDialog';

const IndexContent = () => {
  const { user, loading } = useAuth();
  const { currentDocument, updateDocument, autoCreateDocument } = useDocuments();
  const [content, setContent] = useState('');
  const autoCreateTriggered = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);
      autoCreateTriggered.current = false;
    } else if (!user) {
      // Only load from localStorage for guest users
      const savedContent = localStorage.getItem('markdown-content');
      if (savedContent) {
        setContent(savedContent);
      }
      autoCreateTriggered.current = false;
    } else {
      // Authenticated user with no document - start with empty content
      setContent('');
      autoCreateTriggered.current = false;
    }
  }, [currentDocument, user]);

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (user && currentDocument) {
      // Auto-save for authenticated users with existing document (debounced)
      saveTimeoutRef.current = setTimeout(() => {
        updateDocument(currentDocument.id, currentDocument.title, newContent, false);
      }, 1000);
    } else if (user && !currentDocument && !autoCreateTriggered.current && newContent.trim().length > 10) {
      // Auto-create document for authenticated users when they start typing substantial content
      autoCreateTriggered.current = true;
      try {
        await autoCreateDocument(newContent);
      } catch (error) {
        console.error('Auto-create document failed:', error);
        autoCreateTriggered.current = false;
      }
    } else if (!user) {
      // Save to localStorage for guest users only
      localStorage.setItem('markdown-content', newContent);
    }
  };

  // Cleanup timeout on unmount
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      {!user && <SignInExperienceDialog />}
      <ModernHeader content={content} onFormat={setContent} />
      <div className="flex-1 overflow-hidden">
        <UnifiedEditor
          value={content}
          onChange={handleContentChange}
          className="h-full transition-all duration-200"
        />
      </div>
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
