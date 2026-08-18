import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Sparkles, Moon, Sun, HelpCircle, FileDown, Code,
    Bold, Italic, Heading1, List, Quote, Link, PanelLeft, Settings, Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { DURATION, EASE, Hint, LAYER, ROW_GUTTER, SCRIM, SectionRule, SELECTED, STRIP } from '@/components/chrome';
import { useCommandRegistry, Command } from '@/hooks/useCommandRegistry';
import { useTheme } from '@/components/ui/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVisualViewport } from '@/hooks/useVisualViewport';

/**
 * The order the groups stand in when nothing is typed — roughly the order a
 * writer reaches for them. A search query drops the grouping entirely: rank by
 * relevance then, not by category.
 */
const CATEGORY_ORDER = ['File', 'Export', 'Format', 'View', 'AI', 'LaTeX Lab', 'Help'];

export interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (commandId: string) => void;
    content: string;
}

const iconMap: Record<string, React.ReactNode> = {
    'file-text': <FileText className="h-3.5 w-3.5" />,
    'download': <Download className="h-3.5 w-3.5" />,
    'file-down': <FileDown className="h-3.5 w-3.5" />,
    'sparkles': <Sparkles className="h-3.5 w-3.5" />,
    'moon': <Moon className="h-3.5 w-3.5" />,
    'sun': <Sun className="h-3.5 w-3.5" />,
    'help': <HelpCircle className="h-3.5 w-3.5" />,
    'code': <Code className="h-3.5 w-3.5" />,
    'bold': <Bold className="h-3.5 w-3.5" />,
    'italic': <Italic className="h-3.5 w-3.5" />,
    'heading': <Heading1 className="h-3.5 w-3.5" />,
    'list': <List className="h-3.5 w-3.5" />,
    'quote': <Quote className="h-3.5 w-3.5" />,
    'link': <Link className="h-3.5 w-3.5" />,
    'panel': <PanelLeft className="h-3.5 w-3.5" />,
    'settings': <Settings className="h-3.5 w-3.5" />,
    'focus': <Maximize2 className="h-3.5 w-3.5" />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onCommand,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const isMobile = useIsMobile();
    const viewport = useVisualViewport();
    // The input autofocuses, so on a phone the keyboard is up the moment the
    // palette opens. dvh cannot see the keyboard; visualViewport can — budget
    // the list against the space genuinely left above it (top offset 8 +
    // prompt row 41 + breathing room ≈ 72).
    const listMaxHeight =
        isMobile && viewport.height > 0 ? Math.max(120, Math.min(360, viewport.height - 72)) : 360;
    const listRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme, resolvedTheme } = useTheme();

    const commands: Command[] = [
        {
            id: 'new-document',
            name: 'New document',
            description: 'Create a blank document',
            shortcut: '⌘⌥N',
            icon: 'file-text',
            category: 'File',
            action: () => onCommand('new-document'),
        },
        {
            id: 'export-markdown',
            name: 'Export as Markdown',
            description: 'Download the manuscript as .md',
            icon: 'download',
            category: 'Export',
            action: () => onCommand('export-markdown'),
        },
        {
            id: 'export-html',
            name: 'Export as HTML',
            description: 'Download the typeset page as .html',
            icon: 'file-down',
            category: 'Export',
            action: () => onCommand('export-html'),
        },
        {
            id: 'ai-format',
            name: 'AI formatting…',
            description: 'Open the AI formatting panel',
            icon: 'sparkles',
            category: 'AI',
            action: () => onCommand('ai-format'),
        },
        {
            id: 'format-bold',
            name: 'Bold',
            shortcut: '⌘B',
            icon: 'bold',
            category: 'Format',
            action: () => onCommand('format-bold'),
        },
        {
            id: 'format-italic',
            name: 'Italic',
            shortcut: '⌘I',
            icon: 'italic',
            category: 'Format',
            action: () => onCommand('format-italic'),
        },
        {
            id: 'format-code',
            name: 'Inline code',
            shortcut: '⌘`',
            icon: 'code',
            category: 'Format',
            action: () => onCommand('format-code'),
        },
        {
            id: 'format-heading',
            name: 'Heading',
            shortcut: '⌘⇧H',
            icon: 'heading',
            category: 'Format',
            action: () => onCommand('format-heading'),
        },
        {
            id: 'format-list',
            name: 'Bullet list',
            shortcut: '⌘⇧L',
            icon: 'list',
            category: 'Format',
            action: () => onCommand('format-list'),
        },
        {
            id: 'format-quote',
            name: 'Quote',
            shortcut: '⌘⇧Q',
            icon: 'quote',
            category: 'Format',
            action: () => onCommand('format-quote'),
        },
        {
            id: 'format-link',
            name: 'Link',
            shortcut: '⌘K',
            icon: 'link',
            category: 'Format',
            action: () => onCommand('format-link'),
        },
        {
            id: 'toggle-theme',
            name: resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
            description: `Currently: ${theme}`,
            icon: resolvedTheme === 'dark' ? 'sun' : 'moon',
            category: 'View',
            action: () => {
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                onClose();
            },
        },
        {
            id: 'focus-mode',
            name: 'Focus mode',
            description: 'Write fullscreen, no chrome',
            shortcut: '⌘⇧F',
            icon: 'focus',
            category: 'View',
            action: () => onCommand('focus-mode'),
        },
        {
            id: 'toggle-sidebar',
            name: 'Toggle index',
            shortcut: '⌘\\',
            icon: 'panel',
            category: 'View',
            action: () => onCommand('toggle-sidebar'),
        },
        {
            id: 'open-settings',
            name: 'Settings…',
            description: 'Theme, AI key',
            icon: 'settings',
            category: 'View',
            action: () => onCommand('open-settings'),
        },
        {
            id: 'keyboard-shortcuts',
            name: 'Keyboard shortcuts',
            icon: 'help',
            category: 'Help',
            action: () => onCommand('keyboard-shortcuts'),
        },
        {
            id: 'open-latex-lab',
            name: 'Open LaTeX Lab',
            description: 'Compile full LaTeX documents to PDF, entirely in your browser',
            icon: 'code',
            category: 'LaTeX Lab',
            action: () => onCommand('open-latex-lab'),
        },
    ];

    const { search, addRecentCommand, getRecentCommandObjects } = useCommandRegistry({ commands });

    const filteredCommands = query ? search(query) : commands;
    const recentCommands = getRecentCommandObjects();

    /**
     * The list as rendered: named groups when browsing, one flat relevance-
     * ranked run when searching. Every row's keyboard index is its position in
     * the flattening of this, so grouping never desyncs from navigation.
     */
    const sections = useMemo(() => {
        if (query) return [{ title: null, items: filteredCommands }];

        const groups = CATEGORY_ORDER.map((title) => ({
            title,
            items: filteredCommands.filter((cmd) => cmd.category === title),
        })).filter((group) => group.items.length > 0);

        const ungrouped = filteredCommands.filter(
            (cmd) => !cmd.category || !CATEGORY_ORDER.includes(cmd.category)
        );
        if (ungrouped.length > 0) groups.push({ title: 'Other', items: ungrouped });

        const recentSlice = recentCommands.slice(0, 3);
        return recentSlice.length > 0
            ? [{ title: 'Recent', items: recentSlice }, ...groups]
            : groups;
    }, [query, filteredCommands, recentCommands]);

    const visibleCommands = sections.flatMap((section) => section.items);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const executeCommand = useCallback(
        (command: Command) => {
            addRecentCommand(command.id);
            command.action();
            onClose();
        },
        [addRecentCommand, onClose]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < visibleCommands.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : visibleCommands.length - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (visibleCommands[selectedIndex]) {
                        executeCommand(visibleCommands[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [visibleCommands, selectedIndex, onClose, executeCommand]
    );

    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: DURATION.floatOut } }}
                        transition={{ duration: 0.12 }}
                        className={cn('fixed inset-0', LAYER.palette, SCRIM)}
                        onClick={onClose}
                    />

                    <div className={cn('pointer-events-none fixed inset-x-0 top-[18%] flex justify-center px-4 max-md:top-2', LAYER.palette)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.985, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: DURATION.floatOut } }}
                        transition={{ duration: DURATION.floatIn, ease: EASE }}
                        className="pointer-events-auto w-full max-w-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Command palette"
                    >
                        <div className="overflow-hidden border border-border bg-popover shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                            {/* The ex-command line */}
                            <div className={cn('flex items-center gap-2 border-b border-border', ROW_GUTTER)}>
                                <span className="font-mono text-base font-bold text-primary" aria-hidden="true">
                                    :
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="command"
                                    className="h-10 w-full bg-transparent font-mono text-base placeholder:text-muted-foreground/70 focus:outline-none md:text-sm"
                                />
                            </div>

                            <div ref={listRef} className="overflow-y-auto py-1" style={{ maxHeight: listMaxHeight }}>
                                {visibleCommands.length > 0 ? (
                                    sections.map((section, sectionIndex) => {
                                        // Rows before this one, so each row keeps its flat index
                                        const offset = sections
                                            .slice(0, sectionIndex)
                                            .reduce((sum, prev) => sum + prev.items.length, 0);

                                        return (
                                            <div key={section.title ?? 'results'} className="pb-1 last:pb-0">
                                                {section.title && (
                                                    <SectionRule className="mb-1">{section.title}</SectionRule>
                                                )}
                                                {section.items.map((cmd, index) => (
                                                    <CommandItem
                                                        key={`${section.title ?? 'results'}-${cmd.id}`}
                                                        command={cmd}
                                                        isSelected={selectedIndex === offset + index}
                                                        dataIndex={offset + index}
                                                        onClick={() => executeCommand(cmd)}
                                                        onMouseEnter={() => setSelectedIndex(offset + index)}
                                                    />
                                                ))}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-3 py-10 text-center">
                                        <Hint>No command matches “{query}”.</Hint>
                                    </div>
                                )}
                            </div>

                            {/* Key caps are a hardware-keyboard promise; a thumb gets the rows themselves. */}
                            <div
                                className={cn(
                                    'hidden items-center gap-4 border-b-0 border-t py-1.5 text-muted-foreground sm:flex',
                                    STRIP,
                                    ROW_GUTTER
                                )}
                            >
                                <span className="flex items-center gap-1.5">
                                    <Kbd keys="↑↓" />
                                    <Hint as="span">navigate</Hint>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Kbd keys="↵" />
                                    <Hint as="span">run</Hint>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Kbd keys="esc" />
                                    <Hint as="span">close</Hint>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

interface CommandItemProps {
    command: Command;
    isSelected: boolean;
    dataIndex: number;
    onClick: () => void;
    onMouseEnter: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({
    command,
    isSelected,
    dataIndex,
    onClick,
    onMouseEnter,
}) => {
    return (
        <button
            data-index={dataIndex}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            className={cn(
                'flex w-full items-center gap-3 py-[7px] text-left font-mono text-[13px]',
                ROW_GUTTER,
                isSelected ? SELECTED : 'text-foreground'
            )}
        >
            <span className={cn('shrink-0', isSelected ? 'text-background' : 'text-muted-foreground')}>
                {command.icon && iconMap[command.icon]}
            </span>
            {/* The description gives ground first; past that the name truncates
                rather than handing the whole list a horizontal scrollbar */}
            <span className="min-w-0 shrink truncate whitespace-nowrap">{command.name}</span>
            {command.description && (
                <span
                    className={cn(
                        'min-w-0 flex-1 truncate text-[11px]',
                        isSelected ? 'text-background/70' : 'text-muted-foreground'
                    )}
                >
                    {command.description}
                </span>
            )}
            {command.shortcut && (
                <Kbd
                    keys={command.shortcut}
                    tone={isSelected ? 'inverse' : 'chrome'}
                    className="ml-auto shrink-0 max-sm:hidden"
                />
            )}
        </button>
    );
};
