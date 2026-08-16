import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import {
  exportToMarkdown,
  exportToHtml,
  exportToPdf,
  exportToWord,
  exportToText,
  exportToLatex,
} from '@/utils/exportUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DURATION, EASE, ICON, Label, LabelButton, ROW_GUTTER } from '@/components/chrome';

interface ExportMenuProps {
  content: string;
  documentName?: string;
}

type Format = 'markdown' | 'html' | 'pdf' | 'word' | 'text' | 'latex';

const EXPORT_OPTIONS: { id: Format; ext: string; label: string }[] = [
  { id: 'markdown', ext: '.md', label: 'Markdown' },
  { id: 'html', ext: '.html', label: 'HTML' },
  { id: 'pdf', ext: '.pdf', label: 'PDF' },
  { id: 'word', ext: '.doc', label: 'Word' },
  { id: 'text', ext: '.txt', label: 'Plain text' },
  { id: 'latex', ext: '.tex', label: 'LaTeX' },
];

function slugify(name: string) {
  const slug = name.replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-').toLowerCase();
  return slug || 'document';
}

const ExportMenu = ({ content, documentName }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<Format | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleExport = async (format: Format) => {
    if (!content.trim()) {
      toast.error('Nothing to export yet');
      return;
    }

    const filename = slugify(documentName || 'document');
    setExporting(format);
    try {
      switch (format) {
        case 'markdown':
          await exportToMarkdown(content, filename);
          break;
        case 'html':
          await exportToHtml(content, filename);
          break;
        case 'pdf':
          await exportToPdf(content, filename);
          break;
        case 'word':
          await exportToWord(content, filename);
          break;
        case 'text':
          await exportToText(content, filename);
          break;
        case 'latex':
          await exportToLatex(content, documentName || 'document');
          break;
      }

      toast.success(`Exported ${filename}${EXPORT_OPTIONS.find((o) => o.id === format)?.ext}`);
      setIsOpen(false);
    } catch {
      toast.error('Export failed. Try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative">
      <LabelButton
        onClick={() => setIsOpen((v) => !v)}
        disabled={exporting !== null}
        active={isOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        icon={
          exporting ? (
            <Loader2 className={cn(ICON.sm, 'animate-spin [animation-duration:600ms]')} />
          ) : (
            <Download className={ICON.sm} />
          )
        }
      >
        Export
      </LabelButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: DURATION.state, ease: EASE }}
              style={{ transformOrigin: 'top right' }}
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-44 border border-border bg-popover shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              {EXPORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  role="menuitem"
                  onClick={() => handleExport(option.id)}
                  disabled={exporting !== null}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 py-1.5 text-left font-mono text-[12px]',
                    ROW_GUTTER,
                    'border-b border-border last:border-b-0',
                    'hover:bg-secondary disabled:opacity-50'
                  )}
                >
                  <span className="cap-center">{option.label}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Label>{option.ext}</Label>
                    {exporting === option.id && (
                      <Loader2 className={cn(ICON.sm, 'animate-spin text-primary [animation-duration:600ms]')} />
                    )}
                  </span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;
