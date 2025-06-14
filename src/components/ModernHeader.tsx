
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from './ExportMenu';
import DocumentSidebar from './DocumentSidebar';
import VersionHistory from './VersionHistory';
import { toast } from 'sonner';
import { saveMarkdown } from '@/utils/markdownUtils';
import { supabase } from '@/integrations/supabase/client';
import { Star, Github, Sparkles, Save, FileText, Menu, Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';

interface ModernHeaderProps {
  content: string;
  onFormat: (formattedContent: string) => void;
}

const ModernHeader = ({ content, onFormat }: ModernHeaderProps) => {
  const { user, signOut } = useAuth();
  const { currentDocument, updateDocument, createVersion, versions, restoreVersion } = useDocuments();
  const [showDocuments, setShowDocuments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const handleSave = async () => {
    if (!user) {
      // For guest users, save to localStorage
      localStorage.setItem('markdown-content', content);
      toast.success('Content saved locally!');
      return;
    }

    if (currentDocument) {
      await updateDocument(currentDocument.id, currentDocument.title, content, true);
      toast.success('Document saved with new version!');
    } else {
      toast.error('No document selected');
    }
  };

  const handleFormat = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('format', {
        body: { content }
      });

      if (error) throw error;

      onFormat(data.formattedContent);
      toast.success('Content formatted successfully!');
    } catch (error) {
      console.error('Format error:', error);
      toast.error('Failed to format content');
    }
  };

  const handleShowVersions = () => {
    if (!user) {
      toast.error('Please sign in to access version history');
      return;
    }
    if (!currentDocument) {
      toast.error('Please select a document first');
      return;
    }
    setShowVersions(true);
  };

  // Guest user header - simplified but with all essential tools
  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Markdown Studio</h1>
              <p className="text-xs text-muted-foreground">Convert & Format with AI</p>
            </div>
          </div>
          
          {/* Guest actions - all essential tools available */}
          <div className="flex items-center gap-2">
            <ExportMenu content={content} />
            
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
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
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button
              onClick={handleFormat}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Format AI</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/auth'}
              className="ml-2"
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDocuments(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
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
              className="hidden sm:flex items-center gap-2"
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
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            
            <Button 
              onClick={handleSave} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button
              onClick={handleFormat}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Format AI</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
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
