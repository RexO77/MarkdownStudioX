
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
    updateDocument
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
        // Create initial version
        await createVersion(result.id, content, title, 'Initial version');
        toast.success('Document created automatically!');
      }
      return result;
    } catch (error) {
      console.error('Auto-create failed:', error);
      toast.error('Failed to create document');
      return null;
    }
  };

  const updateDocumentWithVersion = async (id: string, title: string, content: string, createNewVersion: boolean = false) => {
    await updateDocument(id, title, content, createNewVersion);
    
    if (createNewVersion) {
      await createVersion(id, content, title, 'Manual save');
    }
  };

  const restoreVersion = async (version: any) => {
    await restoreVersionBase(version, currentDocument, updateDocumentWithVersion);
  };

  const selectDocument = async (document: any) => {
    console.log('Document selected:', document.title);
    await setCurrentDocument(document);
    // Automatically fetch versions when a document is selected
    if (document?.id) {
      await fetchVersions(document.id);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching documents');
      fetchDocuments();
    } else {
      // Clear state when user logs out
      console.log('User not authenticated, clearing state');
      setDocuments([]);
      setCurrentDocument(null);
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
    generateTitleFromContent
  };
};

// Re-export types for backward compatibility
export type { Document, DocumentVersion } from '@/types/document';
