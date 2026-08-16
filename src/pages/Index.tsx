import React, { useState, useEffect, useRef, useCallback } from 'react';
import UnifiedEditor, { EditorView } from '@/components/UnifiedEditor';
import ModernHeader from '@/components/ModernHeader';
import { StatusBar } from '@/components/ui/status-bar';
import { CommandPalette } from '@/components/CommandPalette';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { AIPanel } from '@/components/AIPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { exportToMarkdown, exportToHtml } from '@/utils/exportUtils';
import { useDocuments } from '@/hooks/useDocuments';
import { useFocusMode } from '@/hooks/useFocusMode';
import { documentStats as computeDocumentStats } from '@/lib/text-stats';
import { isLatexDocument, LATEX_HANDOFF_KEY } from '@/lib/latex';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Index = () => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [view, setView] = useState<EditorView>('split');
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0,
  });

  const {
    documents,
    activeDocument,
    saveFailed,
    createDocument,
    updateDocument,
    deleteDocument,
    setActiveDocument,
    renameDocument,
    toggleFavorite,
  } = useDocuments();

  const { isFocusMode, enterFocusMode, exitFocusMode } = useFocusMode();

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const formatRef = useRef<((format: string) => void) | null>(null);
  const initialDocumentCreationPending = useRef(false);

  // Create initial document if none exist
  useEffect(() => {
    if (documents.length > 0) {
      initialDocumentCreationPending.current = false;
    } else if (!initialDocumentCreationPending.current) {
      initialDocumentCreationPending.current = true;
      createDocument('Welcome');
    }
  }, [documents.length, createDocument]);

  // Global shortcuts: ⌘P command palette, ⌘\ sidebar
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

  // Document statistics — the same count the index reports
  useEffect(() => {
    setDocumentStats(computeDocumentStats(activeDocument?.content || ''));
  }, [activeDocument?.content]);

  // A pasted \documentclass document isn't markdown — offer the LaTeX Lab.
  // One toast per document; clears if the LaTeX goes away so a re-paste
  // offers again. Content is read at click time via ref, not toast time.
  const navigate = useNavigate();
  const latexToastFor = useRef<string | null>(null);
  const contentRef = useRef('');
  contentRef.current = activeDocument?.content || '';
  useEffect(() => {
    const docId = activeDocument?.id;
    if (!docId) return;
    if (!isLatexDocument(activeDocument?.content || '')) {
      if (latexToastFor.current === docId) latexToastFor.current = null;
      return;
    }
    if (latexToastFor.current === docId) return;
    latexToastFor.current = docId;
    toast('LaTeX document detected', {
      description: 'This is a full LaTeX document, not markdown. Compile it to a PDF in the LaTeX Lab.',
      duration: 12000,
      action: {
        label: 'Open LaTeX Lab',
        onClick: () => {
          sessionStorage.setItem(LATEX_HANDOFF_KEY, contentRef.current);
          navigate('/latex');
        },
      },
    });
  }, [activeDocument?.content, activeDocument?.id, navigate]);

  // Documents persist synchronously in useDocuments; the statusline holds
  // "saving…" briefly while typing so the state change is legible.
  const activeDocId = activeDocument?.id;

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!activeDocId) return;

      updateDocument(activeDocId, { content: newContent });
      setSavingStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        setSavingStatus('saved');
      }, 600);
    },
    [activeDocId, updateDocument]
  );

  const effectiveSavingStatus = saveFailed ? 'error' : savingStatus;

  const handleCreateDocument = useCallback(() => {
    createDocument();
    toast.success('New document created');
  }, [createDocument]);

  const requestDeleteDocument = useCallback((id: string) => {
    setPendingDelete(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (pendingDelete) {
      deleteDocument(pendingDelete);
      setPendingDelete(null);
      toast.success('Document deleted');
    }
  }, [pendingDelete, deleteDocument]);

  // Command palette routing
  const handleCommand = useCallback(
    (commandId: string) => {
      const content = activeDocument?.content || '';

      if (commandId.startsWith('format-')) {
        formatRef.current?.(commandId.replace('format-', ''));
        setShowCommandPalette(false);
        return;
      }

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
        case 'focus-mode':
          enterFocusMode();
          break;
        case 'ai-format':
          setShowAIPanel(true);
          break;
        case 'open-settings':
          setShowSettings(true);
          break;
        case 'keyboard-shortcuts':
          setShowShortcuts(true);
          break;
        case 'open-latex-lab':
          // Carry the current document along when it's LaTeX itself.
          if (isLatexDocument(content)) {
            sessionStorage.setItem(LATEX_HANDOFF_KEY, content);
          }
          navigate('/latex');
          break;
      }
      setShowCommandPalette(false);
    },
    [activeDocument, handleCreateDocument, enterFocusMode, navigate]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const pendingDeleteDoc = documents.find((d) => d.id === pendingDelete);

  return (
    <div className="flex h-full flex-col bg-background">
      {!isFocusMode && (
        <ModernHeader
          content={activeDocument?.content || ''}
          documentName={activeDocument?.name}
          sidebarOpen={showSidebar}
          onToggleSidebar={() => setShowSidebar((prev) => !prev)}
          onOpenSettings={() => setShowSettings(true)}
          onRenameDocument={(name) => activeDocId && renameDocument(activeDocId, name)}
        />
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DocumentSidebar
          isOpen={showSidebar && !isFocusMode}
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={setActiveDocument}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={requestDeleteDocument}
          onRenameDocument={renameDocument}
          onToggleFavorite={toggleFavorite}
        />

        <div className="min-w-0 flex-1">
          <UnifiedEditor
            value={activeDocument?.content || ''}
            onChange={handleContentChange}
            docId={activeDocument?.id}
            className="h-full"
            formatRef={formatRef}
            onViewChange={setView}
            onCursorChange={setCursor}
            onOpenAIPanel={() => setShowAIPanel(true)}
            isFocusMode={isFocusMode}
            onEnterFocus={enterFocusMode}
            onExitFocus={exitFocusMode}
          />
        </div>

        <AIPanel
          isOpen={showAIPanel && !isFocusMode}
          onClose={() => setShowAIPanel(false)}
          content={activeDocument?.content || ''}
          onContentChange={handleContentChange}
        />
      </div>

      {!isFocusMode && (
        <StatusBar
          documentName={activeDocument?.name}
          view={view}
          cursor={view === 'read' ? undefined : cursor}
          documentStats={documentStats}
          savingStatus={effectiveSavingStatus}
          onOpenCommands={() => setShowCommandPalette(true)}
        />
      )}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
        content={activeDocument?.content || ''}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <ShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="border-border font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold uppercase tracking-[0.04em]">
              Delete “{pendingDeleteDoc?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs text-muted-foreground">
              This removes the document from your browser permanently. There is no undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs uppercase tracking-[0.06em]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive font-mono text-xs uppercase tracking-[0.06em] text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
