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
          className="flex items-center gap-2 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md 
            hover:border-magical-300 dark:hover:border-magical-400"
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
          className="text-base transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md 
            hover:border-magical-300 dark:hover:border-magical-400"
        >
          Save
        </Button>
        <Button
          onClick={handleFormat}
          variant="default"
          size="default"
          className="bg-magical-900 hover:bg-magical-800 text-magical-300 hover:text-magical-200 border-magical-400 
            text-base font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg 
            flex items-center gap-2 relative overflow-hidden group"
        >
          <span className="relative z-10">Format with AI</span>
          <Sparkles className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
          <div className="absolute inset-0 bg-gradient-to-r from-magical-800 to-magical-900 opacity-0 
            group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;