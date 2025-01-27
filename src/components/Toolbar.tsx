import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from './ExportMenu';
import { toast } from 'sonner';
import { saveMarkdown } from '@/utils/markdownUtils';
import { supabase } from '@/integrations/supabase/client';
import { Star, Github, Sparkles } from 'lucide-react';

interface ToolbarProps {
  content: string;
  onFormat: (formattedContent: string) => void;
}

const Toolbar = ({ content, onFormat }: ToolbarProps) => {
  const handleSave = () => {
    saveMarkdown(content);
    toast.success('Content saved successfully!');
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

  return (
    <div className="flex justify-between items-center p-4 border-b border-editor-border bg-white dark:bg-gray-800">
      <div className="flex gap-2">
        <ExportMenu content={content} />
        <Button
          variant="outline"
          size="default"
          className="flex items-center gap-2"
          onClick={() => window.open('https://github.com/RexO77/MarkdowntoTextconverter', '_blank')}
        >
          <Github className="h-4 w-4" />
          <Star className="h-4 w-4" />
          Star
        </Button>
      </div>
      <div className="flex gap-4 items-center">
        <Button 
          onClick={handleSave} 
          variant="outline"
          size="default"
          className="text-base"
        >
          Save
        </Button>
        <Button
          onClick={handleFormat}
          variant="default"
          size="default"
          className="bg-magical-900 hover:bg-magical-800 text-magical-300 hover:text-magical-200 border-magical-400 
            text-base font-medium transition-colors duration-200 flex items-center gap-2"
        >
          Format with AI
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;