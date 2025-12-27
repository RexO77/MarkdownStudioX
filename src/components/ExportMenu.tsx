
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileDown, ChevronDown, Check } from 'lucide-react';
import { exportToPdf, exportToWord, exportToText, exportToLatex } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportMenuProps {
  content: string;
}

const exportOptions = [
  { id: 'pdf', label: 'Export as PDF', icon: FileText, format: 'pdf' as const },
  { id: 'word', label: 'Export as Word', icon: FileDown, format: 'word' as const },
  { id: 'divider', label: '', icon: null, format: null },
  { id: 'text', label: 'Export as Text', icon: FileText, format: 'text' as const },
  { id: 'latex', label: 'Export as LaTeX', icon: FileDown, format: 'latex' as const },
];

const ExportMenu = ({ content }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentExport, setRecentExport] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const generateTitleFromContent = (content: string) => {
    const firstLine = content.split('\n')[0] || '';
    const title = firstLine.replace(/^#\s*/, '').trim();
    return title || 'Untitled Document';
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleExport = async (format: 'pdf' | 'word' | 'text' | 'latex') => {
    try {
      if (format === 'pdf') {
        await exportToPdf(content);
      } else if (format === 'word') {
        await exportToWord(content);
      } else if (format === 'text') {
        await exportToText(content);
      } else if (format === 'latex') {
        const title = generateTitleFromContent(content);
        await exportToLatex(content, title);
      }

      setRecentExport(format);
      setTimeout(() => setRecentExport(null), 2000);
      toast.success(`Successfully exported to ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <ChevronDown className="h-3 w-3 opacity-60" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-border bg-background p-1 shadow-lg z-50"
            style={{ backgroundColor: 'hsl(var(--background))' }}
          >
            {exportOptions.map((option, index) => {
              if (option.id === 'divider') {
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="my-1 h-px bg-border"
                  />
                );
              }

              const Icon = option.icon!;
              const isRecent = recentExport === option.format;

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{
                    backgroundColor: 'hsl(var(--accent))',
                    transition: { duration: 0.15 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  onClick={() => handleExport(option.format!)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground cursor-pointer focus:outline-none"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isRecent ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </motion.div>
                  <span>{option.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;

