
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DocumentVersion } from '@/types/document';

export const useDocumentVersions = () => {
  const { user } = useAuth();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

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

  const restoreVersion = async (version: DocumentVersion, currentDocument: any, updateDocument: any) => {
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

  return {
    versions,
    setVersions,
    createVersion,
    fetchVersions,
    restoreVersion
  };
};
