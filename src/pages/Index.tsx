
import React, { useState, useEffect, useRef, useCallback } from 'react';
import UnifiedEditor from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { StatusBar } from '@/components/ui/status-bar';
import { CommandPalette } from '@/components/CommandPalette';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { AIPanel } from '@/components/AIPanel';
import { exportToMarkdown, exportToHtml } from '@/utils/exportUtils';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from 'sonner';

const Index = () => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0
  });

  const {
    documents,
    activeDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    setActiveDocument,
    renameDocument,
    toggleFavorite,
  } = useDocuments();

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const contentRef = useRef(activeDocument?.content || '');

  // Keep contentRef updated for beforeunload handler
  useEffect(() => {
    contentRef.current = activeDocument?.content || '';
  }, [activeDocument?.content]);

  // Create initial document if none exist
  useEffect(() => {
    if (documents.length === 0) {
      createDocument('Welcome');
    }
  }, [documents.length, createDocument]);

  // Cmd+P to open command palette, Cmd+\ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate document statistics
  useEffect(() => {
    const content = activeDocument?.content || '';
    // Filter out markdown syntax for more accurate word count
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`[^`]+`/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const words = plainText ? plainText.split(/\s+/).filter(w => w.length > 0).length : 0;
    const characters = content.length;
    const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

    setDocumentStats({ words, characters, readingTime });
  }, [activeDocument?.content]);

  const handleContentChange = useCallback((newContent: string) => {
    if (!activeDocument) return;

    updateDocument(activeDocument.id, { content: newContent });

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Also save to legacy key for backwards compatibility
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('markdown-content', newContent);
    }, 500);
  }, [activeDocument, updateDocument]);

  const handleCreateDocument = useCallback(() => {
    createDocument();
    toast.success('New document created');
  }, [createDocument]);

  const handleDeleteDocument = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
      toast.success('Document deleted');
    }
  }, [deleteDocument]);

  // Command palette handlers
  const handleCommand = useCallback((commandId: string) => {
    const content = activeDocument?.content || '';

    switch (commandId) {
      case 'new-document':
        handleCreateDocument();
        break;
      case 'export-markdown':
        exportToMarkdown(content, activeDocument?.name || 'document');
        toast.success('Exported as Markdown');
        break;
      case 'export-html':
        exportToHtml(content, activeDocument?.name || 'document');
        toast.success('Exported as HTML');
        break;
      case 'toggle-sidebar':
        setShowSidebar((prev) => !prev);
        break;
      case 'keyboard-shortcuts':
        toast.info('Shortcuts: ⌘B Bold, ⌘I Italic, ⌘K Link, ⌘F Find, ⌘P Commands, ⌘\\ Sidebar');
        break;
    }
    setShowCommandPalette(false);
  }, [activeDocument, handleCreateDocument]);

  // Cleanup and beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeDocument) {
        localStorage.setItem('markdown-content', contentRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeDocument]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <ModernHeader content={activeDocument?.content || ''} />

      <div className="flex-1 flex overflow-hidden">
        {/* Document Sidebar */}
        <DocumentSidebar
          isOpen={showSidebar}
          onToggle={() => setShowSidebar((prev) => !prev)}
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={setActiveDocument}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
          onRenameDocument={renameDocument}
          onToggleFavorite={toggleFavorite}
        />

        {/* Main Editor Area */}
        <div className={`flex-1 transition-all duration-200 ${showSidebar ? 'ml-72' : 'ml-0'}`}>
          <UnifiedEditor
            value={activeDocument?.content || ''}
            onChange={handleContentChange}
            className="h-full"
          />
        </div>
      </div>

      <StatusBar
        documentStats={documentStats}
        savingStatus="saved"
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
        content={activeDocument?.content || ''}
      />

      {/* AI Enhancement Panel */}
      <AIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        content={activeDocument?.content || ''}
        onContentChange={handleContentChange}
      />
    </div>
  );
};

export default Index;
