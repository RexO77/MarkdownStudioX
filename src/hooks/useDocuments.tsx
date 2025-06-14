
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
  const [saving, setSaving] = useState(false);

  const generateTitleFromContent = (content: string): string => {
    const firstLine = content.split('\n')[0].trim();
    if (firstLine && firstLine.length > 0) {
      const cleanTitle = firstLine.replace(/^#+\s*/, '').replace(/\*\*|\*|`/g, '');
      return cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + '...' : cleanTitle;
    }
    return 'Untitled Document';
  };

  const autoCreateDocument = async (content: string): Promise<Document | null> => {
    if (!user || currentDocument) return null;

    const title = generateTitleFromContent(content);
    setSaving(true);
    try {
      const result = await createDocument(title, content);
      toast.success('Document created automatically!');
      return result;
    } catch (error) {
      console.error('Auto-create failed:', error);
      toast.error('Failed to create document');
      return null;
    } finally {
      setSaving(false);
    }
  };

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

    setSaving(true);
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
      
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateDocument = async (id: string, title: string, content: string, createNewVersion: boolean = false) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      if (createNewVersion) {
        await createVersion(id, content, title, 'Manual save');
        toast.success('Document saved with new version!');
      }

      await fetchDocuments();
      
      if (currentDocument?.id === id) {
        setCurrentDocument(prev => prev ? { ...prev, title, content } : null);
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    } finally {
      setSaving(false);
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

      if (error) {
        console.error('Error in create_document_version RPC:', error);
        throw error;
      }
      
      // Refresh versions after creating new one
      await fetchVersions(documentId);
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to create version');
    }
  };

  const fetchVersions = async (documentId: string) => {
    if (!user || !documentId) {
      console.log('Cannot fetch versions: no user or documentId');
      return;
    }

    try {
      console.log('Fetching versions for document:', documentId);
      
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching versions:', error);
        throw error;
      }
      
      console.log('Fetched versions:', data);
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load version history');
    }
  };

  const restoreVersion = async (version: DocumentVersion) => {
    if (!currentDocument) {
      toast.error('No current document to restore to');
      return;
    }

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
    } else {
      // Clear state when user logs out
      setDocuments([]);
      setCurrentDocument(null);
      setVersions([]);
    }
  }, [user]);

  return {
    documents,
    currentDocument,
    versions,
    loading,
    saving,
    setCurrentDocument,
    createDocument,
    updateDocument,
    createVersion,
    fetchVersions,
    restoreVersion,
    fetchDocuments,
    autoCreateDocument,
    generateTitleFromContent
  };
};
