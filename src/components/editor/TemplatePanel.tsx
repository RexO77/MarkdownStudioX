import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Code, ListChecks, Quote, Info } from 'lucide-react';
import { DURATION, EASE, GUTTER, ICON, Label, LabelButton, STRIP } from '@/components/chrome';
import { cn } from '@/lib/utils';

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
          transition={{ duration: DURATION.state, ease: EASE }}
          className={cn('shrink-0 overflow-hidden', STRIP)}
          role="toolbar"
          aria-label="Insert template"
        >
          <div className={cn('flex items-center gap-1 overflow-x-auto py-1', GUTTER)}>
            <Label weight="strong" className="pr-1.5 text-muted-foreground">
              Insert
            </Label>
            {TEMPLATES.map(({ icon: Icon, name, label, content }) => (
              <LabelButton
                key={name}
                size="row"
                icon={<Icon className={cn(ICON.sm, 'text-muted-foreground')} />}
                onClick={() => {
                  onInsertTemplate(content);
                  onClose();
                }}
                className="shrink-0 border border-border bg-background text-foreground"
              >
                {label}
              </LabelButton>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
