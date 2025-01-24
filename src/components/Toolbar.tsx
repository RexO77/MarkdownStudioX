import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from './ExportMenu';
import { Save } from 'lucide-react';
import { saveMarkdown } from '@/utils/markdownUtils';
import { toast } from 'sonner';

interface ToolbarProps {
  content: string;
}

const Toolbar = ({ content }: ToolbarProps) => {
  const handleSave = () => {
    saveMarkdown(content);
    toast.success('Document saved successfully');
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b border-editor-border bg-white">
      <Button variant="outline" onClick={handleSave}>
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>
      <ExportMenu content={content} />
    </div>
  );
};

export default Toolbar;