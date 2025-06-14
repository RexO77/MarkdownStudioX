
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  title: string;
  version_number: number;
  change_summary: string | null;
  created_at: string;
}

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (title: string = 'Untitled Document', content: string = '') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title,
          content
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchDocuments();
      setCurrentDocument(data);
      
      // Create initial version
      await createVersion(data.id, content, title, 'Initial version');
      
      toast.success('Document created successfully');
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
      return null;
    }
  };

  const updateDocument = async (id: string, title: string, content: string, createNewVersion: boolean = false) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      if (createNewVersion) {
        await createVersion(id, content, title, 'Manual save');
      }

      await fetchDocuments();
      
      // Update current document if it's the one being edited
      if (currentDocument?.id === id) {
        setCurrentDocument(prev => prev ? { ...prev, title, content } : null);
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const createVersion = async (documentId: string, content: string, title: string, changeSummary?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('create_document_version', {
        p_document_id: documentId,
        p_content: content,
        p_title: title,
        p_change_summary: changeSummary
      });

      if (error) throw error;
      await fetchVersions(documentId);
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to create version');
    }
  };

  const fetchVersions = async (documentId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load version history');
    }
  };

  const restoreVersion = async (version: DocumentVersion) => {
    if (!currentDocument) return;

    try {
      await updateDocument(currentDocument.id, version.title, version.content, true);
      toast.success(`Restored to version ${version.version_number}`);
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  return {
    documents,
    currentDocument,
    versions,
    loading,
    setCurrentDocument,
    createDocument,
    updateDocument,
    createVersion,
    fetchVersions,
    restoreVersion,
    fetchDocuments
  };
};
