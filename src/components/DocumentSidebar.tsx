
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document, useDocuments } from '@/hooks/useDocuments';
import { Plus, FileText, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentSidebar = ({ isOpen, onClose }: DocumentSidebarProps) => {
  const { user, signOut } = useAuth();
  const { 
    documents, 
    currentDocument, 
    createDocument, 
    setCurrentDocument, 
    fetchDocuments 
  } = useDocuments();
  
  const [newDocTitle, setNewDocTitle] = useState('');
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }
    
    try {
      const doc = await createDocument(newDocTitle);
      if (doc) {
        await setCurrentDocument(doc);
        setNewDocTitle('');
        setShowNewDocForm(false);
        onClose();
        toast.success('Document created successfully!');
      }
    } catch (error) {
      console.error('Create document error:', error);
      toast.error('Failed to create document');
    }
  };

  const handleSelectDocument = async (doc: Document) => {
    try {
      console.log('Selecting document from sidebar:', doc.title, 'content length:', doc.content?.length || 0);
      await setCurrentDocument(doc);
      onClose();
      toast.success(`Opened "${doc.title}"`);
    } catch (error) {
      console.error('Select document error:', error);
      toast.error('Failed to open document');
    }
  };

  const handleDeleteDocument = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      return;
    }

    setDeletingDoc(doc.id);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_active: false })
        .eq('id', doc.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Refresh documents list
      await fetchDocuments();
      
      // If this was the current document, clear it
      if (currentDocument?.id === doc.id) {
        setCurrentDocument(null);
      }
      
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete document error:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeletingDoc(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewDocForm(!showNewDocForm)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {showNewDocForm && (
              <div className="space-y-2">
                <Input
                  placeholder="Document title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateDocument}>
                    Create
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowNewDocForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent group",
                    currentDocument?.id === doc.id && "bg-accent border-primary"
                  )}
                  onClick={() => handleSelectDocument(doc)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.content?.length || 0} characters
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteDocument(doc, e)}
                      disabled={deletingDoc === doc.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No documents yet</p>
                  <p className="text-sm">Create your first document</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={signOut}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentSidebar;
