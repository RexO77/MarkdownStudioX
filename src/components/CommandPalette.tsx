import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, FileText, Download, Sparkles, Moon, Sun, Settings,
    HelpCircle, FileDown, Code, Bold, Italic, Heading1, List,
    Quote, Link, PanelLeft, Type, Palette
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCommandRegistry, Command } from '@/hooks/useCommandRegistry';
import { useTheme } from '@/components/ui/theme-provider';

export interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (commandId: string) => void;
    content: string;
}

const iconMap: Record<string, React.ReactNode> = {
    'file-text': <FileText className="h-4 w-4" />,
    'download': <Download className="h-4 w-4" />,
    'file-down': <FileDown className="h-4 w-4" />,
    'sparkles': <Sparkles className="h-4 w-4" />,
    'moon': <Moon className="h-4 w-4" />,
    'sun': <Sun className="h-4 w-4" />,
    'settings': <Settings className="h-4 w-4" />,
    'help': <HelpCircle className="h-4 w-4" />,
    'code': <Code className="h-4 w-4" />,
    'bold': <Bold className="h-4 w-4" />,
    'italic': <Italic className="h-4 w-4" />,
    'heading': <Heading1 className="h-4 w-4" />,
    'list': <List className="h-4 w-4" />,
    'quote': <Quote className="h-4 w-4" />,
    'link': <Link className="h-4 w-4" />,
    'panel': <PanelLeft className="h-4 w-4" />,
    'type': <Type className="h-4 w-4" />,
    'palette': <Palette className="h-4 w-4" />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onCommand,
    content,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();

    // Define all commands
    const commands: Command[] = [
        // File commands
        {
            id: 'new-document',
            name: 'New Document',
            description: 'Create a new blank document',
            shortcut: '⌘N',
            icon: 'file-text',
            category: 'File',
            action: () => onCommand('new-document'),
        },
        {
            id: 'export-markdown',
            name: 'Export as Markdown',
            description: 'Download document as .md file',
            shortcut: '⌘⇧M',
            icon: 'download',
            category: 'Export',
            action: () => onCommand('export-markdown'),
        },
        {
            id: 'export-html',
            name: 'Export as HTML',
            description: 'Download document as .html file',
            shortcut: '⌘⇧H',
            icon: 'file-down',
            category: 'Export',
            action: () => onCommand('export-html'),
        },
        // AI commands
        {
            id: 'ai-format',
            name: 'Format with AI',
            description: 'Use AI to format and improve your document',
            shortcut: '⌘⇧F',
            icon: 'sparkles',
            category: 'AI',
            action: () => onCommand('ai-format'),
        },
        // Format commands
        {
            id: 'format-bold',
            name: 'Bold',
            description: 'Make selected text bold',
            shortcut: '⌘B',
            icon: 'bold',
            category: 'Format',
            action: () => onCommand('format-bold'),
        },
        {
            id: 'format-italic',
            name: 'Italic',
            description: 'Make selected text italic',
            shortcut: '⌘I',
            icon: 'italic',
            category: 'Format',
            action: () => onCommand('format-italic'),
        },
        {
            id: 'format-code',
            name: 'Inline Code',
            description: 'Format as inline code',
            shortcut: '⌘`',
            icon: 'code',
            category: 'Format',
            action: () => onCommand('format-code'),
        },
        {
            id: 'format-heading',
            name: 'Heading',
            description: 'Add heading to current line',
            shortcut: '⌘⇧H',
            icon: 'heading',
            category: 'Format',
            action: () => onCommand('format-heading'),
        },
        {
            id: 'format-list',
            name: 'Bullet List',
            description: 'Add bullet point to current line',
            shortcut: '⌘⇧L',
            icon: 'list',
            category: 'Format',
            action: () => onCommand('format-list'),
        },
        {
            id: 'format-quote',
            name: 'Quote',
            description: 'Add blockquote to current line',
            shortcut: '⌘⇧Q',
            icon: 'quote',
            category: 'Format',
            action: () => onCommand('format-quote'),
        },
        {
            id: 'format-link',
            name: 'Link',
            description: 'Add link to selected text',
            shortcut: '⌘K',
            icon: 'link',
            category: 'Format',
            action: () => onCommand('format-link'),
        },
        // View commands
        {
            id: 'toggle-theme',
            name: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            description: 'Toggle between dark and light theme',
            icon: theme === 'dark' ? 'sun' : 'moon',
            category: 'View',
            action: () => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                onClose();
            },
        },
        {
            id: 'toggle-preview',
            name: 'Toggle Preview Panel',
            description: 'Show or hide the preview panel',
            icon: 'panel',
            category: 'View',
            action: () => onCommand('toggle-preview'),
        },
        // Help
        {
            id: 'keyboard-shortcuts',
            name: 'Keyboard Shortcuts',
            description: 'View all available keyboard shortcuts',
            shortcut: '⌘/',
            icon: 'help',
            category: 'Help',
            action: () => onCommand('keyboard-shortcuts'),
        },
    ];

    const { search, addRecentCommand, getRecentCommandObjects } = useCommandRegistry({ commands });

    const filteredCommands = query ? search(query) : commands;
    const recentCommands = getRecentCommandObjects();

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredCommands.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredCommands.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [filteredCommands, selectedIndex, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    const executeCommand = (command: Command) => {
        addRecentCommand(command.id);
        command.action();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
                    >
                        <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center px-4 gap-3 border-b">
                                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a command or search..."
                                    className="border-0 focus-visible:ring-0 h-12 text-base bg-transparent"
                                />
                            </div>

                            {/* Commands List */}
                            <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2">
                                {/* Recent Commands */}
                                {!query && recentCommands.length > 0 && (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                            Recent
                                        </div>
                                        {recentCommands.slice(0, 3).map((cmd, index) => (
                                            <CommandItem
                                                key={`recent-${cmd.id}`}
                                                command={cmd}
                                                isSelected={selectedIndex === index}
                                                dataIndex={index}
                                                onClick={() => executeCommand(cmd)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                            />
                                        ))}
                                        <div className="my-2 border-t" />
                                    </>
                                )}

                                {/* All/Filtered Commands */}
                                {filteredCommands.length > 0 ? (
                                    filteredCommands.map((cmd, index) => (
                                        <CommandItem
                                            key={cmd.id}
                                            command={cmd}
                                            isSelected={selectedIndex === index}
                                            dataIndex={index}
                                            onClick={() => executeCommand(cmd)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        No commands found
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↑↓</kbd>
                                        navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd>
                                        select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">esc</kbd>
                                        close
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
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
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/50'
            )}
        >
            <div className="shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                {command.icon && iconMap[command.icon]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{command.name}</div>
                {command.description && (
                    <div className="text-xs text-muted-foreground truncate">
                        {command.description}
                    </div>
                )}
            </div>
            {command.shortcut && (
                <kbd className="shrink-0 px-2 py-1 rounded bg-muted font-mono text-xs text-muted-foreground">
                    {command.shortcut}
                </kbd>
            )}
        </button>
    );
};
