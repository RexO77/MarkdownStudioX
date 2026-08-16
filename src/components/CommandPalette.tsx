import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Sparkles, Moon, Sun, HelpCircle, FileDown, Code,
    Bold, Italic, Heading1, List, Quote, Link, PanelLeft, Settings, Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { DURATION, EASE, Label, ROW_GUTTER, SectionRule, SELECTED, STRIP } from '@/components/chrome';
import { useCommandRegistry, Command } from '@/hooks/useCommandRegistry';
import { useTheme } from '@/components/ui/theme-provider';

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
    const listRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme, resolvedTheme } = useTheme();

    const commands: Command[] = [
        {
            id: 'new-document',
            name: 'New document',
            description: 'Create a blank document',
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
    ];

    const { search, addRecentCommand, getRecentCommandObjects } = useCommandRegistry({ commands });

    const filteredCommands = query ? search(query) : commands;
    const recentCommands = getRecentCommandObjects();
    // One flat list drives keyboard navigation; recent rows come first
    const recentSlice = !query ? recentCommands.slice(0, 3) : [];
    const visibleCommands = [...recentSlice, ...filteredCommands];

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
                        className="fixed inset-0 z-50 bg-foreground/25 dark:bg-black/55"
                        onClick={onClose}
                    />

                    <div className="pointer-events-none fixed inset-x-0 top-[18%] z-50 flex justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.985, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: DURATION.floatOut } }}
                        transition={{ duration: DURATION.floatIn, ease: EASE }}
                        className="pointer-events-auto w-full max-w-lg"
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
                                    className="h-10 w-full bg-transparent font-mono text-sm placeholder:text-muted-foreground/70 focus:outline-none"
                                />
                            </div>

                            <div ref={listRef} className="max-h-[320px] overflow-y-auto">
                                {!query && recentCommands.length > 0 && <SectionRule>Recent</SectionRule>}
                                {recentSlice.map((cmd, index) => (
                                    <CommandItem
                                        key={`recent-${cmd.id}`}
                                        command={cmd}
                                        isSelected={selectedIndex === index}
                                        dataIndex={index}
                                        onClick={() => executeCommand(cmd)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    />
                                ))}

                                {recentSlice.length > 0 && <SectionRule>All commands</SectionRule>}

                                {filteredCommands.length > 0 ? (
                                    filteredCommands.map((cmd, index) => (
                                        <CommandItem
                                            key={cmd.id}
                                            command={cmd}
                                            isSelected={selectedIndex === recentSlice.length + index}
                                            dataIndex={recentSlice.length + index}
                                            onClick={() => executeCommand(cmd)}
                                            onMouseEnter={() => setSelectedIndex(recentSlice.length + index)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <Label className="text-muted-foreground">No matching command</Label>
                                    </div>
                                )}
                            </div>

                            <div
                                className={cn(
                                    'flex items-center gap-4 border-b-0 border-t py-1.5 text-muted-foreground',
                                    STRIP,
                                    ROW_GUTTER
                                )}
                            >
                                <span className="flex items-center gap-1.5">
                                    <Kbd keys="↑↓" />
                                    <Label>navigate</Label>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Kbd keys="↵" />
                                    <Label>run</Label>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Kbd keys="esc" />
                                    <Label>close</Label>
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
                'flex w-full items-center gap-2.5 py-2 text-left font-mono text-[13px]',
                ROW_GUTTER,
                isSelected ? SELECTED : 'text-foreground'
            )}
        >
            <span className={cn('shrink-0', isSelected ? 'text-background' : 'text-muted-foreground')}>
                {command.icon && iconMap[command.icon]}
            </span>
            <span className="min-w-0 flex-1 truncate">
                {command.name}
                {command.description && (
                    <span className={cn('ml-2 text-[11px]', isSelected ? 'text-background/70' : 'text-muted-foreground')}>
                        {command.description}
                    </span>
                )}
            </span>
            {command.shortcut ? (
                <Kbd keys={command.shortcut} tone={isSelected ? 'inverse' : 'chrome'} className="shrink-0" />
            ) : (
                <Label
                    className={cn(
                        'shrink-0',
                        isSelected ? 'text-background/70' : 'text-muted-foreground/70'
                    )}
                >
                    {command.category}
                </Label>
            )}
        </button>
    );
};
