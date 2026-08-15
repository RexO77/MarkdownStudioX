import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GROUPS: { title: string; items: { keys: string; action: string }[] }[] = [
  {
    title: 'Format',
    items: [
      { keys: '⌘B', action: 'Bold' },
      { keys: '⌘I', action: 'Italic' },
      { keys: '⌘`', action: 'Inline code' },
      { keys: '⌘K', action: 'Link' },
      { keys: '⌘⇧H', action: 'Heading' },
      { keys: '⌘⇧L', action: 'Bullet list' },
      { keys: '⌘⇧Q', action: 'Quote' },
      { keys: '⌘⇧C', action: 'Code block' },
    ],
  },
  {
    title: 'Navigate',
    items: [
      { keys: '⌘P', action: 'Command palette' },
      { keys: '⌘F', action: 'Find & replace' },
      { keys: '⌘\\', action: 'Toggle index' },
      { keys: 'esc', action: 'Close any panel' },
    ],
  },
  {
    title: 'Manuscript',
    items: [
      { keys: '⇥', action: 'Indent line' },
      { keys: '⇧⇥', action: 'Outdent line' },
      { keys: '↵', action: 'Continue list / exit empty item' },
    ],
  },
];

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md gap-0 border-border p-0 font-mono">
      <DialogHeader className="border-b border-border px-4 py-3">
        <DialogTitle className="font-mono text-[12px] font-bold uppercase tracking-[0.06em]">
          Keyboard shortcuts
        </DialogTitle>
        <DialogDescription className="font-mono text-[11px] text-muted-foreground">
          The whole pipeline, one gesture away.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-5 overflow-y-auto px-4 py-4">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              {group.title}
            </h3>
            <div className="divide-y divide-border border border-border">
              {group.items.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between px-2.5 py-1.5 text-[12px]"
                >
                  <span>{item.action}</span>
                  <Kbd keys={item.keys} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
