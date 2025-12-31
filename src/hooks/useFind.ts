import { useState, useCallback, useMemo } from 'react';

export interface FindMatch {
    index: number;
    start: number;
    end: number;
    text: string;
}

export interface UseFindOptions {
    caseSensitive: boolean;
    wholeWord: boolean;
    useRegex: boolean;
}

export interface UseFindReturn {
    query: string;
    setQuery: (query: string) => void;
    matches: FindMatch[];
    currentIndex: number;
    options: UseFindOptions;
    setOptions: (options: Partial<UseFindOptions>) => void;
    goToNext: () => void;
    goToPrev: () => void;
    goToMatch: (index: number) => void;
    replace: (replacement: string) => string;
    replaceAll: (replacement: string) => string;
    totalMatches: number;
}

export const useFind = (content: string): UseFindReturn => {
    const [query, setQuery] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptionsState] = useState<UseFindOptions>({
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
    });

    const setOptions = useCallback((newOptions: Partial<UseFindOptions>) => {
        setOptionsState((prev) => ({ ...prev, ...newOptions }));
        setCurrentIndex(0); // Reset to first match when options change
    }, []);

    const matches = useMemo((): FindMatch[] => {
        if (!query) return [];

        try {
            let pattern: RegExp;
            let searchQuery = query;

            if (!options.useRegex) {
                // Escape special regex characters for literal search
                searchQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }

            if (options.wholeWord) {
                searchQuery = `\\b${searchQuery}\\b`;
            }

            const flags = options.caseSensitive ? 'g' : 'gi';
            pattern = new RegExp(searchQuery, flags);

            const foundMatches: FindMatch[] = [];
            let match: RegExpExecArray | null;
            let matchIndex = 0;

            while ((match = pattern.exec(content)) !== null) {
                foundMatches.push({
                    index: matchIndex++,
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                });

                // Prevent infinite loops for zero-length matches
                if (match[0].length === 0) {
                    pattern.lastIndex++;
                }
            }

            return foundMatches;
        } catch {
            // Invalid regex, return empty
            return [];
        }
    }, [content, query, options]);

    const totalMatches = matches.length;

    const goToNext = useCallback(() => {
        if (totalMatches === 0) return;
        setCurrentIndex((prev) => (prev + 1) % totalMatches);
    }, [totalMatches]);

    const goToPrev = useCallback(() => {
        if (totalMatches === 0) return;
        setCurrentIndex((prev) => (prev - 1 + totalMatches) % totalMatches);
    }, [totalMatches]);

    const goToMatch = useCallback((index: number) => {
        if (index >= 0 && index < totalMatches) {
            setCurrentIndex(index);
        }
    }, [totalMatches]);

    const replace = useCallback((replacement: string): string => {
        if (totalMatches === 0 || currentIndex >= matches.length) return content;

        const match = matches[currentIndex];
        return content.slice(0, match.start) + replacement + content.slice(match.end);
    }, [content, matches, currentIndex, totalMatches]);

    const replaceAll = useCallback((replacement: string): string => {
        if (totalMatches === 0) return content;

        try {
            let searchQuery = query;

            if (!options.useRegex) {
                searchQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }

            if (options.wholeWord) {
                searchQuery = `\\b${searchQuery}\\b`;
            }

            const flags = options.caseSensitive ? 'g' : 'gi';
            const pattern = new RegExp(searchQuery, flags);

            return content.replace(pattern, replacement);
        } catch {
            return content;
        }
    }, [content, query, options, totalMatches]);

    return {
        query,
        setQuery: (q: string) => {
            setQuery(q);
            setCurrentIndex(0);
        },
        matches,
        currentIndex,
        options,
        setOptions,
        goToNext,
        goToPrev,
        goToMatch,
        replace,
        replaceAll,
        totalMatches,
    };
};
