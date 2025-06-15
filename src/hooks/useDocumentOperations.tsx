
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
    if (!user) {
      console.log('No user found for fetching documents');
      setDocuments([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching documents for user:', user.id);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('Fetched documents:', data?.length || 0);
      setDocuments(data || []);
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
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title,
          content
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }
      
      console.log('Created document:', data.id);
      
      // Add to local state immediately
      setDocuments(prev => [data, ...prev]);
      
      return data;
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
      const { error } = await supabase
        .from('documents')
        .update({ 
          title, 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      console.log('Document updated successfully');
      
      // Update current document if it's the one being updated
      if (currentDocument?.id === id) {
        const updatedDoc = { 
          ...currentDocument, 
          title, 
          content, 
          updated_at: new Date().toISOString() 
        };
        setCurrentDocument(updatedDoc);
        
        // Update in documents list
        setDocuments(prev => prev.map(doc => 
          doc.id === id ? updatedDoc : doc
        ));
      }

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
