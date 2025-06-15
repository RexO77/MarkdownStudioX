
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useDocumentOperations } from './useDocumentOperations';
import { useDocumentVersions } from './useDocumentVersions';
import { generateTitleFromContent } from '@/utils/documentUtils';

export const useDocuments = () => {
  const { user } = useAuth();
  const {
    documents,
    currentDocument,
    loading,
    saving,
    setCurrentDocument,
    setDocuments,
    fetchDocuments,
    createDocument,
    updateDocument,
    clearCurrentDocument
  } = useDocumentOperations();

  const {
    versions,
    setVersions,
    createVersion,
    fetchVersions,
    restoreVersion: restoreVersionBase
  } = useDocumentVersions();

  const autoCreateDocument = async (content: string) => {
    if (!user || currentDocument) return null;

    const title = generateTitleFromContent(content);
    try {
      console.log('Auto-creating document with title:', title);
      const result = await createDocument(title, content);
      if (result) {
        // Set as current document and create initial version
        const selectedDoc = await setCurrentDocument(result);
        await createVersion(result.id, content, title, 'Initial version');
        toast.success('Document created automatically!');
        return selectedDoc;
      }
      return result;
    } catch (error) {
      console.error('Auto-create failed:', error);
      toast.error('Failed to create document');
      return null;
    }
  };

  const updateDocumentWithVersion = async (id: string, title: string, content: string, createNewVersion: boolean = false) => {
    const success = await updateDocument(id, title, content);
    
    if (success && createNewVersion) {
      await createVersion(id, content, title, 'Manual save');
    }
    
    return success;
  };

  const restoreVersion = async (version: any) => {
    await restoreVersionBase(version, currentDocument, updateDocumentWithVersion);
  };

  const selectDocument = async (document: any) => {
    console.log('Document selected:', document.title);
    const selectedDoc = await setCurrentDocument(document);
    
    // Fetch versions for the selected document
    if (document?.id) {
      await fetchVersions(document.id);
    }
    
    return selectedDoc;
  };

  const saveCurrentDocument = async (title: string, content: string, createNewVersion: boolean = false) => {
    if (!user) {
      localStorage.setItem('markdown-content', content);
      toast.success('Content saved locally!');
      return null;
    }

    if (!currentDocument) {
      // Create new document
      const newDoc = await autoCreateDocument(content);
      return newDoc;
    } else {
      // Update existing document
      const success = await updateDocumentWithVersion(currentDocument.id, title, content, createNewVersion);
      if (success && createNewVersion) {
        toast.success('Document saved with new version!');
      }
      return currentDocument;
    }
  };

  // Initialize documents when user changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching documents');
      fetchDocuments();
    } else {
      console.log('User not authenticated, clearing state');
      setDocuments([]);
      clearCurrentDocument();
      setVersions([]);
    }
  }, [user]);

  // Fetch versions when current document changes
  useEffect(() => {
    if (currentDocument?.id && user) {
      console.log('Current document changed, fetching versions for:', currentDocument.title);
      fetchVersions(currentDocument.id);
    } else {
      setVersions([]);
    }
  }, [currentDocument?.id, user]);

  return {
    documents,
    currentDocument,
    versions,
    loading,
    saving,
    setCurrentDocument: selectDocument,
    createDocument,
    updateDocument: updateDocumentWithVersion,
    createVersion,
    fetchVersions,
    restoreVersion,
    fetchDocuments,
    autoCreateDocument,
    generateTitleFromContent,
    saveCurrentDocument,
    clearCurrentDocument
  };
};

// Re-export types for backward compatibility
export type { Document, DocumentVersion } from '@/types/document';
