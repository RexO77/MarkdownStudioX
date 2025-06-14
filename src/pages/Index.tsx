
import React, { useState, useEffect, useRef } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { AdaptiveLayout } from '@/components/layout/AdaptiveLayout';
import { StatusBar } from '@/components/ui/status-bar';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { SignInExperienceDialog } from '@/components/SignInExperienceDialog';

const IndexContent = () => {
  const { user, loading } = useAuth();
  const { currentDocument, updateDocument, autoCreateDocument } = useDocuments();
  const [content, setContent] = useState('');
  const [floatingToolbar, setFloatingToolbar] = useState({ visible: false, position: { x: 0, y: 0 } });
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0
  });
  const autoCreateTriggered = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);
      autoCreateTriggered.current = false;
    } else if (!user) {
      const savedContent = localStorage.getItem('markdown-content');
      if (savedContent) {
        setContent(savedContent);
      }
      autoCreateTriggered.current = false;
    } else {
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
    setContent(newContent);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (user && currentDocument) {
      saveTimeoutRef.current = setTimeout(() => {
        updateDocument(currentDocument.id, currentDocument.title, newContent, false);
      }, 1000);
    } else if (user && !currentDocument && !autoCreateTriggered.current && newContent.trim().length > 10) {
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

  const handleFormat = (format: string) => {
    // This will be implemented with the editor enhancements
    console.log('Format:', format);
    setFloatingToolbar({ visible: false, position: { x: 0, y: 0 } });
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      {!user && <SignInExperienceDialog />}
      
      <AdaptiveLayout
        sidebar={<div className="p-4">
          <h3 className="font-semibold mb-2">Files</h3>
          <p className="text-sm text-muted-foreground">Document library will go here</p>
        </div>}
        rightPanel={<div className="p-4">
          <h3 className="font-semibold mb-2">Outline</h3>
          <p className="text-sm text-muted-foreground">Document outline will go here</p>
        </div>}
      >
        <div className="flex flex-col h-full">
          <ModernHeader content={content} onFormat={setContent} />
          
          <div className="flex-1 overflow-hidden">
            <UnifiedEditor
              value={content}
              onChange={handleContentChange}
              className="h-full transition-all duration-200"
            />
          </div>
          
          <StatusBar 
            documentStats={documentStats}
            savingStatus="saved"
            onlineUsers={user ? 1 : 0}
          />
        </div>
      </AdaptiveLayout>

      <FloatingToolbar
        visible={floatingToolbar.visible}
        position={floatingToolbar.position}
        onFormat={handleFormat}
      />
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
