
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
    { 
      icon: Table, 
      name: 'table', 
      label: 'Table',
      content: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`
    },
    { 
      icon: Code, 
      name: 'codeblock', 
      label: 'Code Block',
      content: '```javascript\n// Your code here\n```'
    },
    { 
      icon: List, 
      name: 'checklist', 
      label: 'Checklist',
      content: `- [ ] Task 1
- [ ] Task 2
- [x] Completed task`
    },
    { 
      icon: Quote, 
      name: 'quote', 
      label: 'Quote',
      content: '> This is a blockquote\n> \n> With multiple lines'
    },
    { 
      icon: Sparkles, 
      name: 'note', 
      label: 'Note',
      content: `> [!NOTE]
> This is an informational note`
    },
    { 
      icon: Wand2, 
      name: 'mermaid', 
      label: 'Diagram',
      content: `\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
\`\`\``
    },
  ];

  if (!visible) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      {templates.map(({ icon: Icon, name, label, content }) => (
        <Button
          key={name}
          variant="ghost"
          size="sm"
          onClick={() => {
            onInsertTemplate(content);
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
