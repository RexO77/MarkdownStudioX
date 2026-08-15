import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Code, ListChecks, Quote, Info } from 'lucide-react';

interface TemplatePanelProps {
  visible: boolean;
  onInsertTemplate: (template: string) => void;
  onClose: () => void;
}

const TEMPLATES = [
  {
    icon: Table,
    name: 'table',
    label: 'Table',
    content: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`,
  },
  {
    icon: Code,
    name: 'codeblock',
    label: 'Code block',
    content: '```javascript\n// Your code here\n```',
  },
  {
    icon: ListChecks,
    name: 'checklist',
    label: 'Checklist',
    content: `- [ ] Task 1
- [ ] Task 2
- [x] Completed task`,
  },
  {
    icon: Quote,
    name: 'quote',
    label: 'Quote',
    content: '> This is a blockquote\n> \n> With multiple lines',
  },
  {
    icon: Info,
    name: 'note',
    label: 'Alert',
    content: `> [!NOTE]
> This is an informational note`,
  },
];

export const TemplatePanel = ({ visible, onInsertTemplate, onClose }: TemplatePanelProps) => {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 overflow-hidden border-b border-border bg-secondary/60"
          role="toolbar"
          aria-label="Insert template"
        >
          <div className="flex items-center gap-0.5 overflow-x-auto px-2 py-1">
            <span className="pr-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Insert
            </span>
            {TEMPLATES.map(({ icon: Icon, name, label, content }) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onInsertTemplate(content);
                  onClose();
                }}
                className="inline-flex h-6 shrink-0 items-center gap-1.5 border border-border bg-background px-2 font-mono text-[11px] text-foreground hover:bg-secondary"
              >
                <Icon className="h-3 w-3 text-muted-foreground" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
