
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DocumentVersion } from '@/types/document';

export const useDocumentVersions = () => {
  const { user } = useAuth();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

  const createVersion = async (documentId: string, content: string, title: string, changeSummary?: string) => {
    if (!user) {
      console.log('No user found for creating version');
      return;
    }

    try {
      console.log('Creating version for document:', documentId);
      const newVersion: DocumentVersion = {
        id: crypto.randomUUID(),
        document_id: documentId,
        content,
        title,
        version_number: (versions[0]?.version_number || 0) + 1,
        change_summary: changeSummary || null,
        created_at: new Date().toISOString(),
      };
      setVersions(prev => [newVersion, ...prev]);
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to create version');
    }
  };

  const fetchVersions = async (documentId: string) => {
    if (!user || !documentId) {
      console.log('Cannot fetch versions: no user or documentId', { user: !!user, documentId });
      setVersions([]);
      return;
    }

    try {
      console.log('Fetching versions for document:', documentId);
      // In local mode, versions are in memory for current session
      // No-op fetch can remain
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load version history');
      setVersions([]);
    }
  };

  const restoreVersion = async (version: DocumentVersion, currentDocument: any, updateDocument: any) => {
    if (!currentDocument) {
      toast.error('No current document to restore to');
      return;
    }

    try {
      console.log('Restoring version:', version.version_number);
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
