import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, Replace, CaseSensitive, WholeWord, Regex } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UseFindReturn } from '@/hooks/useFind';
import { DURATION, EASE, ICON, IconButton, Label, LabelButton } from '@/components/chrome';

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    find: UseFindReturn;
    onReplace: (newContent: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose, find, onReplace }) => {
    const [showReplace, setShowReplace] = useState(false);
    const [replaceValue, setReplaceValue] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
                return;
            }

            // Enter/F3 only act inside the search panel; the editor keeps its keys
            const inSearch = containerRef.current?.contains(e.target as Node);
            if (!inSearch) return;

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                find.goToNext();
            } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                find.goToPrev();
            } else if (e.key === 'F3') {
                e.preventDefault();
                if (e.shiftKey) find.goToPrev();
                else find.goToNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, find]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: DURATION.state, ease: EASE }}
                    className="absolute right-2 top-11 z-40 w-[380px] max-w-[calc(100vw-16px)] border border-border bg-popover shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                    role="search"
                >
                    {/* Find row */}
                    <div className="flex items-center gap-1 border-b border-border p-1.5">
                        <span className="cap-center pl-1 font-mono text-[11px] font-bold text-primary" aria-hidden="true">/</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={find.query}
                            onChange={(e) => find.setQuery(e.target.value)}
                            placeholder="find"
                            className="h-6 min-w-0 flex-1 bg-transparent px-1 font-mono text-[12px] placeholder:text-muted-foreground/70 focus:outline-none"
                        />
                        <Label className="shrink-0 px-1 text-muted-foreground">
                            {find.query ? (find.totalMatches > 0 ? `${find.currentIndex + 1}/${find.totalMatches}` : '0/0') : ''}
                        </Label>
                        <IconButton size="row" side="bottom" onClick={find.goToPrev} disabled={find.totalMatches === 0} label="Previous match" shortcut="⇧↵">
                            <ChevronUp className={ICON.md} />
                        </IconButton>
                        <IconButton size="row" side="bottom" onClick={find.goToNext} disabled={find.totalMatches === 0} label="Next match" shortcut="↵">
                            <ChevronDown className={ICON.md} />
                        </IconButton>
                        <IconButton size="row" side="bottom" onClick={() => setShowReplace(!showReplace)} label="Replace" active={showReplace}>
                            <Replace className={ICON.md} />
                        </IconButton>
                        <IconButton size="row" side="bottom" onClick={onClose} label="Close" shortcut="esc">
                            <X className={ICON.md} />
                        </IconButton>
                    </div>

                    {/* Replace row */}
                    <AnimatePresence>
                        {showReplace && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: DURATION.state, ease: EASE }}
                                className="overflow-hidden border-b border-border"
                            >
                                <div className="flex items-center gap-1 p-1.5">
                                    <span className="cap-center pl-1 font-mono text-[11px] font-bold text-muted-foreground" aria-hidden="true">→</span>
                                    <input
                                        type="text"
                                        value={replaceValue}
                                        onChange={(e) => setReplaceValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (find.totalMatches > 0) onReplace(find.replace(replaceValue));
                                            }
                                        }}
                                        placeholder="replace with"
                                        className="h-6 min-w-0 flex-1 bg-transparent px-1 font-mono text-[12px] placeholder:text-muted-foreground/70 focus:outline-none"
                                    />
                                    <LabelButton
                                        size="row"
                                        onClick={() => onReplace(find.replace(replaceValue))}
                                        disabled={find.totalMatches === 0}
                                        className="border border-border text-foreground"
                                    >
                                        One
                                    </LabelButton>
                                    <LabelButton
                                        size="row"
                                        onClick={() => onReplace(find.replaceAll(replaceValue))}
                                        disabled={find.totalMatches === 0}
                                        className="border border-border text-foreground"
                                    >
                                        All
                                    </LabelButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Options row */}
                    <div className="flex items-center gap-0.5 p-1.5">
                        <IconButton
                            size="row"
                            active={find.options.caseSensitive}
                            onClick={() => find.setOptions({ caseSensitive: !find.options.caseSensitive })}
                            label="Match case"
                        >
                            <CaseSensitive className={ICON.md} />
                        </IconButton>
                        <IconButton
                            size="row"
                            active={find.options.wholeWord}
                            onClick={() => find.setOptions({ wholeWord: !find.options.wholeWord })}
                            label="Whole word"
                        >
                            <WholeWord className={ICON.md} />
                        </IconButton>
                        <IconButton
                            size="row"
                            active={find.options.useRegex}
                            onClick={() => find.setOptions({ useRegex: !find.options.useRegex })}
                            label="Regular expression"
                        >
                            <Regex className={ICON.md} />
                        </IconButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
