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
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex gap-2">
        <Button onClick={handleSave} variant="outline">
          Save
        </Button>
        <Button onClick={handleFormat} variant="outline">
          Format with AI
        </Button>
      </div>
      <ExportMenu content={content} />
    </div>
  );
};

export default Toolbar;