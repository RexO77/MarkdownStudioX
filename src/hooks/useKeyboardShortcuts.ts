import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutAction {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description?: string;
}

export interface UseKeyboardShortcutsOptions {
    shortcuts: ShortcutAction[];
    enabled?: boolean;
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) => {
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs (except for our editor)
        const target = e.target as HTMLElement;
        const isInEditor = target.tagName === 'TEXTAREA' || target.closest('[data-editor]');

        if (!isInEditor && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
            return;
        }

        for (const shortcut of shortcutsRef.current) {
            const modifierMatch = isMac
                ? (shortcut.meta === undefined || shortcut.meta === e.metaKey) &&
                (shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey)
                : (shortcut.ctrl === undefined || shortcut.ctrl === (e.ctrlKey || e.metaKey)) &&
                (shortcut.meta === undefined || shortcut.meta === e.metaKey);

            const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
            const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey;
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

            if (modifierMatch && shiftMatch && altMatch && keyMatch) {
                e.preventDefault();
                shortcut.action();
                return;
            }
        }
    }, [enabled]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Helper to insert text at cursor position
export const insertTextAtCursor = (
    textarea: HTMLTextAreaElement,
    before: string,
    after: string = '',
    placeholder: string = ''
): { newValue: string; newCursorPos: number } => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);

    const insertText = selectedText || placeholder;
    const newText = before + insertText + after;
    const newValue = value.substring(0, start) + newText + value.substring(end);

    // Calculate new cursor position
    let newCursorPos: number;
    if (selectedText) {
        // If text was selected, put cursor after the formatted text
        newCursorPos = start + newText.length;
    } else if (placeholder) {
        // If using placeholder, select it
        newCursorPos = start + before.length + placeholder.length;
    } else {
        // Put cursor between the markers
        newCursorPos = start + before.length;
    }

    return { newValue, newCursorPos };
};

// Helper to wrap selected text or insert at cursor
export const wrapSelection = (
    textarea: HTMLTextAreaElement,
    wrapper: string,
    endWrapper?: string
): { newValue: string; newCursorPos: number } => {
    return insertTextAtCursor(textarea, wrapper, endWrapper ?? wrapper, '');
};

// Format a line with prefix (for headings, lists, quotes)
export const formatLine = (
    textarea: HTMLTextAreaElement,
    prefix: string
): { newValue: string; newCursorPos: number } => {
    const start = textarea.selectionStart;
    const value = textarea.value;

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
        lineStart--;
    }

    // Check if the line already has this prefix
    const lineContent = value.substring(lineStart);
    const hasPrefix = lineContent.startsWith(prefix);

    if (hasPrefix) {
        // Remove the prefix
        const newValue = value.substring(0, lineStart) + value.substring(lineStart + prefix.length);
        return { newValue, newCursorPos: start - prefix.length };
    } else {
        // Add the prefix
        const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
        return { newValue, newCursorPos: start + prefix.length };
    }
};
