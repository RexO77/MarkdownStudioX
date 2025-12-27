
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Document } from '@/types/document';

export const useDocumentOperations = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getStorageKey = () => {
    const userId = user?.id || 'guest';
    return `msx_docs_${userId}`;
  };

  const readFromStorage = (): Document[] => {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Document[];
    } catch {
      return [];
    }
  };

  const writeToStorage = (docs: Document[]) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(docs));
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = readFromStorage();
      setDocuments(data);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (title: string = 'Untitled Document', content: string = '') => {
    if (!user) {
      console.log('No user found for creating document');
      return null;
    }

    setSaving(true);
    try {
      console.log('Creating document:', { title, contentLength: content.length });
      const newDoc: Document = {
        id: crypto.randomUUID(),
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const current = readFromStorage();
      const next = [newDoc, ...current];
      writeToStorage(next);
      setDocuments(next);
      return newDoc;
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateDocument = async (id: string, title: string, content: string) => {
    if (!user) {
      console.log('No user found for updating document');
      return false;
    }

    setSaving(true);
    try {
      console.log('Updating document:', { id, title, contentLength: content.length });
      const current = readFromStorage();
      const updatedAt = new Date().toISOString();
      let updated: Document | null = null;
      const next = current.map(doc => {
        if (doc.id === id) {
          updated = { ...doc, title, content, updated_at: updatedAt };
          return updated;
        }
        return doc;
      });
      writeToStorage(next);

      if (currentDocument?.id === id && updated) {
        setCurrentDocument(updated);
      }
      setDocuments(next);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const selectDocument = async (document: Document) => {
    console.log('Selecting document:', document.id, document.title);
    setCurrentDocument(document);
    return document;
  };

  const clearCurrentDocument = () => {
    setCurrentDocument(null);
  };

  return {
    documents,
    currentDocument,
    loading,
    saving,
    setCurrentDocument: selectDocument,
    setDocuments,
    fetchDocuments,
    createDocument,
    updateDocument,
    clearCurrentDocument
  };
};
