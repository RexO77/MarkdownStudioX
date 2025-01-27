import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { exportToPdf, exportToWord } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportMenuProps {
  content: string;
}

const ExportMenu = ({ content }: ExportMenuProps) => {
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      if (format === 'pdf') {
        await exportToPdf(content);
      } else {
        await exportToWord(content);
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
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('word')}
          className="hover:bg-magical-100/10 dark:hover:bg-magical-900/10 transition-colors duration-200 cursor-pointer"
        >
          Export as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;