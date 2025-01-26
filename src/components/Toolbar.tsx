import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from './ExportMenu';
import { toast } from 'sonner';
import { saveMarkdown } from '@/utils/markdownUtils';
import { supabase } from '@/integrations/supabase/client';
import { Star, Github } from 'lucide-react';

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
          onClick={() => window.open('https://github.com/lovable-labs/markdown-editor', '_blank')}
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
        <button
          onClick={handleFormat}
          className="relative z-10 px-4 py-2 h-10 bg-magical-900 border-3 border-magical-400 
            rounded-xl text-magical-300 transition-all duration-250 text-base font-medium
            hover:text-magical-200 hover:bg-magical-800 hover:scale-105 focus:outline-none 
            focus:ring-2 focus:ring-magical-400 focus:ring-offset-2 group"
        >
          <span className="relative z-10 filter drop-shadow">
            Format with AI ✨
          </span>
          <div 
            className="absolute inset-0 rounded-xl opacity-60 transition-opacity
              duration-250 group-hover:opacity-80 animate-magical-glow"
          />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;