
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
        <button
          onClick={handleFormat}
          className="relative inline-flex h-10 items-center justify-center gap-2 
            rounded-md border border-transparent px-6 font-medium 
            text-white shadow-2xl shadow-purple-500/20 transition-all duration-300 
            hover:scale-105 hover:border-slate-800 hover:bg-slate-800/5 
            hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 
            focus:ring-offset-2 dark:border-slate-200 dark:shadow-purple-500/30 
            dark:hover:border-slate-200 dark:hover:bg-slate-200/5 dark:hover:text-slate-200 
            dark:focus:ring-slate-200 overflow-hidden 
            before:absolute before:inset-0 
            before:-z-10 before:translate-y-[150%] before:animate-[shimmer_2s_infinite] 
            before:bg-gradient-to-t before:from-purple-500/0 
            before:via-purple-500/50 before:to-purple-500/0
            after:absolute after:inset-0 
            after:-z-10 after:animate-[shimmer_2s_infinite] 
            after:bg-gradient-to-t after:from-purple-500/0 
            after:via-purple-500/50 after:to-purple-500/0"
        >
          <span className="flex items-center gap-2">
            Format with AI
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
