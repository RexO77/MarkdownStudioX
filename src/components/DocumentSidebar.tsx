
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Document, useDocuments } from '@/hooks/useDocuments';
import { Plus, FileText, Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentSidebar = ({ isOpen, onClose }: DocumentSidebarProps) => {
  const { user, signOut } = useAuth();
  const { documents, currentDocument, createDocument, setCurrentDocument, fetchVersions } = useDocuments();
  const [newDocTitle, setNewDocTitle] = useState('');
  const [showNewDocForm, setShowNewDocForm] = useState(false);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;
    
    const doc = await createDocument(newDocTitle);
    if (doc) {
      setNewDocTitle('');
      setShowNewDocForm(false);
    }
  };

  const handleSelectDocument = async (doc: Document) => {
    setCurrentDocument(doc);
    await fetchVersions(doc.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header */}
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

        {/* Documents List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
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
                  </div>
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

        {/* User Info & Logout */}
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
  );
};

export default DocumentSidebar;
