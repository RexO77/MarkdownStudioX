import { useMemo } from 'react';
import Fuse from 'fuse.js';

export interface Command {
    id: string;
    name: string;
    description?: string;
    shortcut?: string;
    icon?: string;
    category?: string;
    action: () => void;
}

export interface UseCommandRegistryOptions {
    commands: Command[];
}

export const useCommandRegistry = ({ commands }: UseCommandRegistryOptions) => {
    const fuse = useMemo(() => {
        return new Fuse(commands, {
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'description', weight: 0.2 },
                { name: 'category', weight: 0.1 },
            ],
            threshold: 0.4,
            includeScore: true,
            ignoreLocation: true,
        });
    }, [commands]);

    const search = (query: string): Command[] => {
        if (!query.trim()) {
            return commands;
        }
        return fuse.search(query).map((result) => result.item);
    };

    const getRecentCommands = (): string[] => {
        try {
            const stored = localStorage.getItem('command-palette-recent');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const addRecentCommand = (commandId: string) => {
        try {
            const recent = getRecentCommands();
            const filtered = recent.filter((id) => id !== commandId);
            const updated = [commandId, ...filtered].slice(0, 5);
            localStorage.setItem('command-palette-recent', JSON.stringify(updated));
        } catch {
            // Ignore storage errors
        }
    };

    const getRecentCommandObjects = (): Command[] => {
        const recentIds = getRecentCommands();
        return recentIds
            .map((id) => commands.find((cmd) => cmd.id === id))
            .filter((cmd): cmd is Command => cmd !== undefined);
    };

    return {
        commands,
        search,
        getRecentCommands,
        addRecentCommand,
        getRecentCommandObjects,
    };
};
