
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileDown, Lock } from 'lucide-react';
import { exportToPdf, exportToWord, exportToText, exportToLatex } from '@/utils/exportUtils';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from 'sonner';

interface ExportMenuProps {
  content: string;
}

const ExportMenu = ({ content }: ExportMenuProps) => {
  const { user } = useAuth();
  const { currentDocument, generateTitleFromContent } = useDocuments();

  const handleExport = async (format: 'pdf' | 'word' | 'text' | 'latex') => {
    try {
      if (format === 'pdf') {
        await exportToPdf(content);
      } else if (format === 'word') {
        await exportToWord(content);
      } else if (format === 'text') {
        if (!user) {
          toast.error('Sign in required', {
            description: 'Text export is available for signed-in users only'
          });
          return;
        }
        await exportToText(content);
      } else if (format === 'latex') {
        if (!user) {
          toast.error('Sign in required', {
            description: 'LaTeX export is available for signed-in users only'
          });
          return;
        }
        const title = currentDocument?.title || generateTitleFromContent(content);
        await exportToLatex(content, title);
      }
      
      toast.success(`Successfully exported to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  const handleAuthRequiredClick = () => {
    toast.error('Sign in required', {
      description: 'This export format requires authentication'
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out 
            hover:scale-105 hover:shadow-md hover:border-magical-300 dark:hover:border-magical-400 group"
        >
          <Download className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          className="hover:bg-magical-100/10 dark:hover:bg-magical-900/10 transition-colors duration-200 cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('word')}
          className="hover:bg-magical-100/10 dark:hover:bg-magical-900/10 transition-colors duration-200 cursor-pointer"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export as Word
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {user ? (
          <>
            <DropdownMenuItem 
              onClick={() => handleExport('text')}
              className="hover:bg-magical-100/10 dark:hover:bg-magical-900/10 transition-colors duration-200 cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as Text
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('latex')}
              className="hover:bg-magical-100/10 dark:hover:bg-magical-900/10 transition-colors duration-200 cursor-pointer"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export as LaTeX
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem 
              onClick={handleAuthRequiredClick}
              className="hover:bg-red-100/10 dark:hover:bg-red-900/10 transition-colors duration-200 cursor-pointer opacity-60"
            >
              <Lock className="mr-2 h-4 w-4" />
              Export as Text
              <span className="ml-auto text-xs text-muted-foreground">Sign in</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleAuthRequiredClick}
              className="hover:bg-red-100/10 dark:hover:bg-red-900/10 transition-colors duration-200 cursor-pointer opacity-60"
            >
              <Lock className="mr-2 h-4 w-4" />
              Export as LaTeX
              <span className="ml-auto text-xs text-muted-foreground">Sign in</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
