
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentSidebar from './DocumentSidebar';
import VersionHistory from './VersionHistory';
import HeaderLogo from './header/HeaderLogo';
import GuestHeaderActions from './header/GuestHeaderActions';
import AuthenticatedHeaderActions from './header/AuthenticatedHeaderActions';

interface ModernHeaderProps {
  content: string;
  onFormat: (formattedContent: string) => void;
  onNewDocument?: () => void;
}

const ModernHeader = ({ content, onFormat, onNewDocument }: ModernHeaderProps) => {
  const { user, signOut } = useAuth();
  const { 
    currentDocument, 
    versions, 
    restoreVersion, 
    saveCurrentDocument,
    fetchVersions,
    saving
  } = useDocuments();
  
  const [showDocuments, setShowDocuments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleSave = async () => {
    if (!user) {
      localStorage.setItem('markdown-content', content);
      toast.success('Content saved locally!', {
        description: 'Sign in to save to the cloud'
      });
      return;
    }

    try {
      const title = currentDocument?.title || 'Untitled Document';
      await saveCurrentDocument(title, content, true);
      toast.success('Document saved successfully!', {
        description: 'New version created'
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save document');
    }
  };

  const handleFormat = async () => {
    if (!content.trim()) {
      toast.error('No content to format');
      return;
    }

    setIsFormatting(true);
    try {
      const { data, error } = await supabase.functions.invoke('format', {
        body: { content }
      });

      if (error) {
        console.error('Format error:', error);
        toast.error('AI formatting failed');
        return;
      }

      if (data?.formattedContent) {
        onFormat(data.formattedContent);
        toast.success('Content formatted successfully!');
      }
    } catch (error) {
      console.error('Format error:', error);
      toast.error('AI formatting failed');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleShowVersions = async () => {
    if (!user) {
      toast.error('Sign in to view version history');
      return;
    }

    if (!currentDocument) {
      toast.error('No document selected');
      return;
    }

    setIsLoadingHistory(true);
    try {
      await fetchVersions(currentDocument.id);
      setShowVersions(true);
    } catch (error) {
      console.error('History error:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <HeaderLogo 
            currentDocument={currentDocument}
            onMenuClick={user ? () => setShowDocuments(true) : undefined}
            showMenu={!!user}
            onNewDocument={onNewDocument}
          />
          
          {user ? (
            <AuthenticatedHeaderActions
              content={content}
              onSave={handleSave}
              onShowVersions={handleShowVersions}
              onFormat={handleFormat}
              onSignOut={signOut}
              saving={saving}
              isFormatting={isFormatting}
              isLoadingHistory={isLoadingHistory}
            />
          ) : (
            <GuestHeaderActions
              content={content}
              onSave={handleSave}
            />
          )}
        </div>
      </header>

      {user && (
        <>
          <DocumentSidebar 
            isOpen={showDocuments} 
            onClose={() => setShowDocuments(false)} 
          />
          
          <VersionHistory
            versions={versions}
            onRestore={restoreVersion}
            isOpen={showVersions}
            onClose={() => setShowVersions(false)}
          />
        </>
      )}
    </>
  );
};

export default ModernHeader;
