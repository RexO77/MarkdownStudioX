import React from 'react';
import { Button } from './ui/button';
import { saveMarkdown } from '@/utils/markdownUtils';
import ExportMenu from './ExportMenu';
import { toast } from './ui/use-toast';
import { formatMarkdownWithAI } from '@/utils/aiUtils';

interface ToolbarProps {
  content: string;
  onFormat: (content: string) => void;
}

const Toolbar = ({ content, onFormat }: ToolbarProps) => {
  const handleSave = () => {
    saveMarkdown(content);
    toast({
      title: "Saved",
      description: "Your markdown has been saved locally.",
    });
  };

  const handleFormat = async () => {
    try {
      toast({
        title: "Processing",
        description: "Formatting your markdown with AI. This may take a moment for larger documents...",
      });

      const formattedContent = await formatMarkdownWithAI(content);
      if (formattedContent) {
        onFormat(formattedContent);
        toast({
          title: "Formatted",
          description: "Your markdown has been formatted using AI.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format markdown. Please try again.",
        variant: "destructive",
      });
      console.error('Formatting error:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex gap-2">
        <Button onClick={handleSave} variant="outline">
          Save
        </Button>
        <Button 
          onClick={handleFormat} 
          className="relative bg-white hover:bg-gray-50 text-gray-900 border border-gray-200
            before:absolute before:inset-0 before:rounded-md before:animate-rainbow-border before:border-2 before:border-transparent
            before:bg-gradient-to-r before:from-[#8B5CF6] before:via-[#D946EF] before:to-[#0EA5E9]
            before:bg-clip-border before:-z-10 before:hover:animate-rainbow-border-fast"
        >
          Format with AI
        </Button>
      </div>
      <ExportMenu content={content} />
    </div>
  );
};

export default Toolbar;