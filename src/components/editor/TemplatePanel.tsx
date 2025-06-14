
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, Code, List, Quote, Sparkles, Wand2 } from 'lucide-react';

interface TemplatePanelProps {
  visible: boolean;
  onInsertTemplate: (template: string) => void;
  onClose: () => void;
}

export const TemplatePanel = ({ visible, onInsertTemplate, onClose }: TemplatePanelProps) => {
  const templates = [
    { icon: Table, name: 'table', label: 'Table' },
    { icon: Code, name: 'codeblock', label: 'Code Block' },
    { icon: List, name: 'checklist', label: 'Checklist' },
    { icon: Quote, name: 'quote', label: 'Quote' },
    { icon: Sparkles, name: 'note', label: 'Note' },
    { icon: Wand2, name: 'mermaid', label: 'Diagram' },
  ];

  if (!visible) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      {templates.map(({ icon: Icon, name, label }) => (
        <Button
          key={name}
          variant="ghost"
          size="sm"
          onClick={() => {
            onInsertTemplate(name);
            onClose();
          }}
          className="h-8 text-xs"
        >
          <Icon className="h-3 w-3 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  );
};
