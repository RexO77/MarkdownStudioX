
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Document } from '@/types/document';

export const useDocumentOperations = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return {
    documents,
    currentDocument,
    loading,
    saving,
    setCurrentDocument,
    setDocuments,
    fetchDocuments,
    createDocument,
    updateDocument
  };
};
