
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
}

const ModernHeader = ({ content, onFormat }: ModernHeaderProps) => {
  const { user, signOut } = useAuth();
  const { 
    currentDocument, 
    updateDocument, 
    createVersion, 
    versions, 
    restoreVersion, 
    autoCreateDocument,
    generateTitleFromContent,
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
      let documentToSave = currentDocument;

      if (!documentToSave) {
        const title = generateTitleFromContent(content);
        documentToSave = await autoCreateDocument(content);
        if (!documentToSave) {
          toast.error('Failed to create document');
          return;
        }
      } else {
        await updateDocument(documentToSave.id, documentToSave.title, content, true);
      }

      toast.success('Document saved successfully!', {
        description: 'New version created'
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save document', {
        description: 'Please try again'
      });
    }
  };

  const handleFormat = async () => {
    if (!content.trim()) {
      toast.error('No content to format', {
        description: 'Please add some content first'
      });
      return;
    }

    setIsFormatting(true);
    try {
      const { data, error } = await supabase.functions.invoke('format', {
        body: { content }
      });

      if (error) {
        console.error('Format error:', error);
        if (error.message?.includes('API key') || error.message?.includes('401')) {
          toast.error('AI formatting unavailable', {
            description: 'API key configuration needed'
          });
        } else {
          toast.error('Failed to format content', {
            description: 'Please try again later'
          });
        }
        return;
      }

      if (data?.formattedContent) {
        onFormat(data.formattedContent);
        toast.success('Content formatted successfully!', {
          description: 'AI enhanced your markdown'
        });
      } else {
        toast.error('No formatted content received', {
          description: 'Please try again'
        });
      }
    } catch (error) {
      console.error('Format error:', error);
      toast.error('AI formatting failed', {
        description: 'Service temporarily unavailable'
      });
    } finally {
      setIsFormatting(false);
    }
  };

  const handleShowVersions = async () => {
    if (!user) {
      toast.error('Sign in required', {
        description: 'Version history is available for signed-in users'
      });
      return;
    }

    setIsLoadingHistory(true);
    try {
      let documentToShow = currentDocument;

      if (!documentToShow) {
        const title = generateTitleFromContent(content);
        documentToShow = await autoCreateDocument(content);
        if (!documentToShow) {
          toast.error('Failed to create document');
          return;
        }
      }

      console.log('Loading versions for document:', documentToShow.id);
      await fetchVersions(documentToShow.id);
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <HeaderLogo 
            currentDocument={currentDocument}
            onMenuClick={user ? () => setShowDocuments(true) : undefined}
            showMenu={!!user}
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
