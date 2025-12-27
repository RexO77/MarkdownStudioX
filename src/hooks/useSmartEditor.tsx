
import { useState, useCallback } from 'react';
import { formatContentWithAI } from '@/utils/aiUtils';
import { toast } from 'sonner';

interface SmartEditorOptions {
  onContentChange: (content: string) => void;
  currentContent: string;
}

export const useSmartEditor = ({ onContentChange, currentContent }: SmartEditorOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const smartFormat = useCallback(async () => {
    if (!currentContent.trim()) {
      toast.error('No content to format');
      return;
    }

    setIsProcessing(true);
    try {
      const formattedContent = await formatContentWithAI(currentContent);
      onContentChange(formattedContent);
      toast.success('Content formatted with AI!');
    } catch (error) {
      console.error('Smart format error:', error);
      toast.error('Failed to format content');
    } finally {
      setIsProcessing(false);
    }
  }, [currentContent, onContentChange]);

  const autoCorrectSyntax = useCallback((text: string): string => {
    // Auto-correct common markdown syntax issues
    let corrected = text;

    // Fix unmatched bold/italic markers
    corrected = corrected.replace(/\*{3,}/g, '***'); // Limit to max 3 asterisks
    corrected = corrected.replace(/_{3,}/g, '___'); // Limit to max 3 underscores

    // Auto-format tables
    corrected = corrected.replace(/\|([^|\n]+)\|([^|\n]+)\|/g, (match, col1, col2) => {
      return `| ${col1.trim()} | ${col2.trim()} |`;
    });

    // Auto-format lists with proper spacing
    corrected = corrected.replace(/^(\d+\.|\*|\-)\s*/gm, (match, marker) => {
      return `${marker} `;
    });

    // Auto-format headers with proper spacing
    corrected = corrected.replace(/^(#{1,6})\s*/gm, (match, hashes) => {
      return `${hashes} `;
    });

    return corrected;
  }, []);

  const insertTemplate = useCallback((template: string) => {
    const templates = {
      table: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`,
      codeblock: '```javascript\n// Your code here\n```',
      checklist: `- [ ] Task 1
- [ ] Task 2
- [x] Completed task`,
      quote: '> This is a blockquote\n> \n> With multiple lines',
      warning: `> [!WARNING]
> This is a warning message`,
      note: `> [!NOTE]
> This is an informational note`,
      mermaid: `\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
\`\`\``,
    };

    const templateContent = templates[template as keyof typeof templates];
    if (templateContent) {
      onContentChange(currentContent + '\n\n' + templateContent + '\n\n');
      toast.success(`${template} template inserted!`);
    }
  }, [currentContent, onContentChange]);

  return {
    smartFormat,
    autoCorrectSyntax,
    insertTemplate,
    isProcessing
  };
};
