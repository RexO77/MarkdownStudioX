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
        <Button variant="outline" className="bg-white dark:bg-gray-800">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('word')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Export as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;