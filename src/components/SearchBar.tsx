import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, Replace, CaseSensitive, WholeWord, Regex } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UseFindReturn } from '@/hooks/useFind';

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    find: UseFindReturn;
    onReplace: (newContent: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    isOpen,
    onClose,
    find,
    onReplace,
}) => {
    const [showReplace, setShowReplace] = useState(false);
    const [replaceValue, setReplaceValue] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                find.goToNext();
            } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                find.goToPrev();
            } else if (e.key === 'F3') {
                e.preventDefault();
                if (e.shiftKey) {
                    find.goToPrev();
                } else {
                    find.goToNext();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, find]);

    const handleReplace = () => {
        const newContent = find.replace(replaceValue);
        onReplace(newContent);
    };

    const handleReplaceAll = () => {
        const newContent = find.replaceAll(replaceValue);
        onReplace(newContent);
    };

    const ToggleButton: React.FC<{
        active: boolean;
        onClick: () => void;
        title: string;
        children: React.ReactNode;
    }> = ({ active, onClick, title, children }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            title={title}
            className={cn(
                'h-7 w-7 p-0 transition-colors',
                active && 'bg-primary/20 text-primary hover:bg-primary/30'
            )}
        >
            {children}
        </Button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-2 right-4 z-50 bg-background border rounded-lg shadow-lg p-3 min-w-[360px]"
                >
                    {/* Search Row */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                value={find.query}
                                onChange={(e) => find.setQuery(e.target.value)}
                                placeholder="Find..."
                                className="h-8 pr-20 text-sm"
                            />
                            {find.query && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {find.totalMatches > 0
                                        ? `${find.currentIndex + 1} of ${find.totalMatches}`
                                        : 'No results'}
                                </span>
                            )}
                        </div>

                        {/* Navigation */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={find.goToPrev}
                            disabled={find.totalMatches === 0}
                            className="h-7 w-7 p-0"
                            title="Previous match (Shift+Enter)"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={find.goToNext}
                            disabled={find.totalMatches === 0}
                            className="h-7 w-7 p-0"
                            title="Next match (Enter)"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        {/* Toggle Replace */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplace(!showReplace)}
                            className={cn('h-7 w-7 p-0', showReplace && 'bg-primary/20')}
                            title="Toggle Replace"
                        >
                            <Replace className="h-4 w-4" />
                        </Button>

                        {/* Close */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-7 w-7 p-0"
                            title="Close (Esc)"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Options Row */}
                    <div className="flex items-center gap-1 mt-2">
                        <ToggleButton
                            active={find.options.caseSensitive}
                            onClick={() => find.setOptions({ caseSensitive: !find.options.caseSensitive })}
                            title="Match Case"
                        >
                            <CaseSensitive className="h-4 w-4" />
                        </ToggleButton>
                        <ToggleButton
                            active={find.options.wholeWord}
                            onClick={() => find.setOptions({ wholeWord: !find.options.wholeWord })}
                            title="Match Whole Word"
                        >
                            <WholeWord className="h-4 w-4" />
                        </ToggleButton>
                        <ToggleButton
                            active={find.options.useRegex}
                            onClick={() => find.setOptions({ useRegex: !find.options.useRegex })}
                            title="Use Regular Expression"
                        >
                            <Regex className="h-4 w-4" />
                        </ToggleButton>
                    </div>

                    {/* Replace Row */}
                    <AnimatePresence>
                        {showReplace && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                    <Input
                                        type="text"
                                        value={replaceValue}
                                        onChange={(e) => setReplaceValue(e.target.value)}
                                        placeholder="Replace with..."
                                        className="h-8 flex-1 text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReplace}
                                        disabled={find.totalMatches === 0}
                                        className="h-7 text-xs"
                                    >
                                        Replace
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReplaceAll}
                                        disabled={find.totalMatches === 0}
                                        className="h-7 text-xs"
                                    >
                                        All
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
