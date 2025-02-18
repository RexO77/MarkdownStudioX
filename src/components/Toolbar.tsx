
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
    <div className="flex justify-between items-center p-4 border-b border-editor-border 
      bg-background dark:bg-gray-900 transition-colors duration-200">
      <div className="flex gap-2">
        <ExportMenu content={content} />
        <Button
          variant="outline"
          size="default"
          className="flex items-center gap-2 transition-all duration-300 ease-in-out 
            hover:scale-105 hover:bg-accent dark:hover:bg-gray-800"
          onClick={() => window.open('https://github.com/RexO77/MarkdowntoTextconverter', '_blank')}
        >
          <Github className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          <Star className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Star
        </Button>
      </div>
      <div className="flex gap-4 items-center">
        <Button 
          onClick={handleSave} 
          variant="outline"
          size="default"
          className="text-base transition-all duration-300 ease-in-out 
            hover:scale-105 hover:bg-accent dark:hover:bg-gray-800"
        >
          Save
        </Button>
        <Button
          onClick={handleFormat}
          variant="outline"
          size="default"
          className="flex items-center gap-2 text-base border-2 border-primary bg-primary text-primary-foreground 
            hover:bg-primary/90 transition-all duration-300 ease-in-out hover:scale-105"
        >
          Format with AI
          <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
