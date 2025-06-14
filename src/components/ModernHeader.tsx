
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from './ExportMenu';
import DocumentSidebar from './DocumentSidebar';
import VersionHistory from './VersionHistory';
import { toast } from 'sonner';
import { saveMarkdown } from '@/utils/markdownUtils';
import { supabase } from '@/integrations/supabase/client';
import { Star, Github, Sparkles, Save, FileText, Menu, Clock, LogOut, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';

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

      onFormat(data.formattedContent);
      toast.success('Content formatted successfully!', {
        description: 'AI enhanced your markdown'
      });
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

      await fetchVersions(documentToShow.id);
      setShowVersions(true);
    } catch (error) {
      console.error('History error:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Guest user header - simplified without Format AI
  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 transform transition-transform hover:scale-105">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground transition-colors">Markdown Studio</h1>
              <p className="text-xs text-muted-foreground">Convert & Format with AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ExportMenu content={content} />
            
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
              onClick={() => window.open('https://github.com/RexO77/MarkdowntoTextconverter', '_blank')}
            >
              <Github className="h-4 w-4" />
              <Star className="h-4 w-4" />
              <span className="hidden md:inline">Star</span>
            </Button>
            
            <Button 
              onClick={handleSave} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/auth'}
              className="ml-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated user header - full functionality
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDocuments(true)}
              className="hover:bg-accent transition-all duration-200 hover:scale-105"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 transform transition-transform hover:scale-105">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground transition-colors">
                {currentDocument?.title || 'Markdown Studio'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentDocument ? 'Document Editor' : 'Convert & Format with AI'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ExportMenu content={content} />
            
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
              onClick={() => window.open('https://github.com/RexO77/MarkdowntoTextconverter', '_blank')}
            >
              <Github className="h-4 w-4" />
              <Star className="h-4 w-4" />
              <span className="hidden md:inline">Star</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShowVersions}
              disabled={isLoadingHistory}
              className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isLoadingHistory ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isLoadingHistory ? 'Loading...' : 'History'}
              </span>
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {saving ? 'Saving...' : 'Save'}
              </span>
            </Button>
            
            <Button
              onClick={handleFormat}
              disabled={isFormatting}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isFormatting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isFormatting ? 'Formatting...' : 'Format AI'}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="hover:bg-accent transition-all duration-200 hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

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
  );
};

export default ModernHeader;
