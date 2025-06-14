
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

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);
      autoCreateTriggered.current = false; // Reset when switching documents
    } else {
      // Load from localStorage for guest users or when no document is selected
      const savedContent = localStorage.getItem('markdown-content');
      if (savedContent) {
        setContent(savedContent);
      }
      autoCreateTriggered.current = false;
    }
  }, [currentDocument]);

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);

    if (user && currentDocument) {
      // Auto-save for authenticated users with existing document
      updateDocument(currentDocument.id, currentDocument.title, newContent, false);
    } else if (user && !currentDocument && !autoCreateTriggered.current && newContent.trim().length > 10) {
      // Auto-create document for authenticated users when they start typing substantial content
      autoCreateTriggered.current = true;
      try {
        await autoCreateDocument(newContent);
      } catch (error) {
        console.error('Auto-create document failed:', error);
        autoCreateTriggered.current = false; // Reset on failure to allow retry
      }
    } else if (!user) {
      // Save to localStorage for guest users
      localStorage.setItem('markdown-content', newContent);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {!user && <SignInExperienceDialog />}
      <ModernHeader content={content} onFormat={setContent} />
      <div className="flex-1 overflow-hidden">
        <UnifiedEditor
          value={content}
          onChange={handleContentChange}
          className="h-full"
        />
      </div>
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
