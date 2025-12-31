import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileDown, ChevronDown, Check, Loader2 } from 'lucide-react';
import { exportToPdf, exportToWord, exportToText, exportToLatex } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportMenuProps {
  content: string;
}

const exportOptions = [
  { id: 'pdf', label: 'PDF', icon: FileText, format: 'pdf' as const },
  { id: 'word', label: 'Word', icon: FileDown, format: 'word' as const },
  { id: 'text', label: 'Text', icon: FileText, format: 'text' as const },
  { id: 'latex', label: 'LaTeX', icon: FileDown, format: 'latex' as const },
];

const ExportMenu = ({ content }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [recentExport, setRecentExport] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const generateTitleFromContent = (content: string) => {
    const firstLine = content.split('\n')[0] || '';
    const title = firstLine.replace(/^#\s*/, '').trim();
    return title || 'Untitled Document';
  };

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
    setIsExporting(true);
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
      toast.success(`Exported to ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      toast.error(`Export failed`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
          bg-gradient-to-b from-primary/90 to-primary text-primary-foreground
          shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
          hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]
          disabled:opacity-50 transition-shadow duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>Export</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ChevronDown className="h-3 w-3 opacity-70" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-full right-0 mt-2 w-40 rounded-xl border border-border 
              bg-background/95 backdrop-blur-md p-1.5 shadow-xl z-50"
          >
            {exportOptions.map((option, index) => {
              const Icon = option.icon;
              const isRecent = recentExport === option.format;

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.15 }}
                  whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport(option.format)}
                  disabled={isExporting}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm 
                    text-foreground cursor-pointer focus:outline-none disabled:opacity-50
                    transition-colors duration-100"
                >
                  <motion.div
                    initial={false}
                    animate={isRecent ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {isRecent ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Icon className="h-4 w-4 opacity-60" />
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
