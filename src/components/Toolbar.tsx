import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from './ExportMenu';
import { toast } from 'sonner';
import { saveMarkdown } from '@/utils/markdownUtils';

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
      const response = await fetch('/api/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to format content');
      }

      const { formattedContent } = await response.json();
      onFormat(formattedContent);
      toast.success('Content formatted successfully!');
    } catch (error) {
      toast.error('Failed to format content');
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-editor-border bg-white dark:bg-gray-800">
      <div className="flex gap-2">
        <ExportMenu content={content} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} variant="outline">
          Save
        </Button>
        <button
          onClick={handleFormat}
          className="relative px-4 py-3 bg-magical-900 border-3 border-magical-400 rounded-xl
            text-magical-300 transition-all duration-250 hover:text-magical-200 
            hover:bg-magical-800 hover:scale-105 focus:outline-none focus:ring-2 
            focus:ring-magical-400 focus:ring-offset-2 group"
        >
          <span className="relative z-10 font-medium filter drop-shadow">
            Format with AI ✨
          </span>
          <div className="absolute inset-0 rounded-xl opacity-60 transition-opacity
            duration-250 group-hover:opacity-80 animate-magical-glow">
          </div>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;