
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileDown } from 'lucide-react';
import { exportToPdf, exportToWord, exportToText, exportToLatex } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportMenuProps {
  content: string;
}

const ExportMenu = ({ content }: ExportMenuProps) => {
  const generateTitleFromContent = (content: string) => {
    const firstLine = content.split('\n')[0] || '';
    const title = firstLine.replace(/^#\s*/, '').trim();
    return title || 'Untitled Document';
  };

  const handleExport = async (format: 'pdf' | 'word' | 'text' | 'latex') => {
    try {
      if (format === 'pdf') {
        await exportToPdf(content);
      } else if (format === 'word') {
        await exportToWord(content);
      } else if (format === 'text') {
        await exportToText(content);
      } else if (format === 'latex') {
        const title = generateTitleFromContent(content);
        await exportToLatex(content, title);
      }

      toast.success(`Successfully exported to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out 
            hover:scale-105 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 group"
        >
          <Download className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          className="hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('word')}
          className="hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export as Word
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport('text')}
          className="hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('latex')}
          className="hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export as LaTeX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
