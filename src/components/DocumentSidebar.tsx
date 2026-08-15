import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Trash2, Pencil, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/hooks/useDocuments';

interface DocumentSidebarProps {
    isOpen: boolean;
    documents: Document[];
    activeDocument: Document | null;
    onSelectDocument: (id: string) => void;
    onCreateDocument: () => void;
    onDeleteDocument: (id: string) => void;
    onRenameDocument: (id: string, name: string) => void;
    onToggleFavorite: (id: string) => void;
}

const SIDEBAR_WIDTH = 264;

function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function wordCount(content: string) {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

const SectionRule: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="border-b border-border bg-secondary/60 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {children}
    </div>
);

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
    isOpen,
    documents,
    activeDocument,
    onSelectDocument,
    onCreateDocument,
    onDeleteDocument,
    onRenameDocument,
    onToggleFavorite,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const filtered = useMemo(() => {
        const sorted = [...documents].sort((a, b) => b.updatedAt - a.updatedAt);
        if (!searchQuery) return sorted;
        const q = searchQuery.toLowerCase();
        return sorted.filter(
            (doc) => doc.name.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q)
        );
    }, [documents, searchQuery]);

    const starred = filtered.filter((doc) => doc.isFavorite);
    const rest = filtered.filter((doc) => !doc.isFavorite);

    const startEditing = (doc: Document) => {
        setEditingId(doc.id);
        setEditingName(doc.name);
    };

    const saveEditing = () => {
        if (editingId && editingName.trim()) {
            onRenameDocument(editingId, editingName.trim());
        }
        setEditingId(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') saveEditing();
        else if (e.key === 'Escape') setEditingId(null);
    };

    // Plain render function, not a nested component: a nested component
    // definition remounts every row on each keystroke and drops input focus.
    const renderDocumentRow = (doc: Document) => {
        const isActive = activeDocument?.id === doc.id;
        const isEditing = editingId === doc.id;

        return (
            <div
                key={doc.id}
                className={cn(
                    'group relative border-b border-border',
                    isActive ? 'bg-foreground text-background' : 'hover:bg-secondary'
                )}
            >
                {isEditing ? (
                    <div className="px-3 py-2">
                        <input
                            ref={editInputRef}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEditing}
                            aria-label="Document name"
                            className={cn(
                                'w-full border border-input bg-background px-1 py-0.5 font-mono text-[12px] font-bold text-foreground',
                                'focus:outline-none focus:ring-1 focus:ring-ring'
                            )}
                        />
                        <span
                            className={cn(
                                'mt-0.5 block font-mono text-[11px] uppercase tracking-[0.06em]',
                                isActive ? 'text-background/70' : 'text-muted-foreground'
                            )}
                        >
                            {formatDate(doc.updatedAt)} · {wordCount(doc.content)} words
                        </span>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onSelectDocument(doc.id)}
                            className="flex w-full flex-col gap-0.5 px-3 py-2 text-left"
                        >
                            <span className="flex items-center gap-1.5 pr-20 font-mono text-[12px] font-bold leading-4">
                                <span className="truncate">{doc.name}</span>
                                {doc.isFavorite && (
                                    <Star
                                        className={cn(
                                            'h-2.5 w-2.5 shrink-0 fill-current',
                                            isActive ? 'text-background/80' : 'text-primary'
                                        )}
                                    />
                                )}
                            </span>
                            <span
                                className={cn(
                                    'font-mono text-[11px] uppercase tracking-[0.06em]',
                                    isActive ? 'text-background/70' : 'text-muted-foreground'
                                )}
                            >
                                {formatDate(doc.updatedAt)} · {wordCount(doc.content)} words
                            </span>
                        </button>

                        <div
                            className={cn(
                                'absolute right-2 top-1/2 flex -translate-y-1/2 items-center opacity-0 transition-opacity',
                                'group-hover:opacity-100 focus-within:opacity-100',
                                '[@media(hover:none)]:opacity-100'
                            )}
                        >
                            <button
                                type="button"
                                aria-label={doc.isFavorite ? 'Remove star' : 'Star document'}
                                onClick={() => onToggleFavorite(doc.id)}
                                className={cn(
                                    'inline-flex h-6 w-6 items-center justify-center',
                                    isActive
                                        ? 'text-background/70 hover:text-background'
                                        : 'text-muted-foreground hover:text-primary'
                                )}
                            >
                                <Star className={cn('h-3 w-3', doc.isFavorite && 'fill-current')} />
                            </button>
                            <button
                                type="button"
                                aria-label="Rename document"
                                onClick={() => startEditing(doc)}
                                className={cn(
                                    'inline-flex h-6 w-6 items-center justify-center',
                                    isActive
                                        ? 'text-background/70 hover:text-background'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                            <button
                                type="button"
                                aria-label="Delete document"
                                onClick={() => onDeleteDocument(doc.id)}
                                className={cn(
                                    'inline-flex h-6 w-6 items-center justify-center',
                                    isActive
                                        ? 'text-background/70 hover:text-background'
                                        : 'text-muted-foreground hover:text-destructive'
                                )}
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.aside
                    initial={{ width: 0 }}
                    animate={{ width: SIDEBAR_WIDTH }}
                    exit={{ width: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full shrink-0 overflow-hidden border-r border-border bg-background"
                >
                    <div className="flex h-full flex-col" style={{ width: SIDEBAR_WIDTH }}>
                        {/* Index head — same 36px track as the editor toolbar so the hairlines meet */}
                        <div className="flex h-9 shrink-0 items-stretch justify-between border-b border-border">
                            <span className="flex items-center pl-3 font-mono text-[11px] font-bold uppercase leading-none tracking-[0.06em] text-muted-foreground">
                                Index ({documents.length})
                            </span>
                            <button
                                type="button"
                                onClick={onCreateDocument}
                                className="inline-flex h-full items-center gap-1 border-l border-border px-2.5 font-mono text-[11px] font-bold uppercase leading-none tracking-[0.04em] text-primary hover:bg-secondary"
                            >
                                <Plus className="size-3 shrink-0" />
                                New
                            </button>
                        </div>

                        {/* grep */}
                        <div className="shrink-0 border-b border-border">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="grep documents…"
                                aria-label="Search documents"
                                className={cn(
                                    'w-full bg-transparent px-3 py-1.5 font-mono text-[12px]',
                                    'placeholder:text-muted-foreground/70 focus:outline-none'
                                )}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {starred.length > 0 && (
                                <>
                                    <SectionRule>Starred</SectionRule>
                                    {starred.map(renderDocumentRow)}
                                </>
                            )}

                            {starred.length > 0 && rest.length > 0 && <SectionRule>All files</SectionRule>}

                            {rest.map(renderDocumentRow)}

                            {filtered.length === 0 && (
                                <div className="px-3 py-10 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                                    {searchQuery ? (
                                        <>
                                            <p>No matches for “{searchQuery}”</p>
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="mt-3 border border-border px-2 py-1 font-bold text-primary hover:bg-secondary"
                                            >
                                                Clear search
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mx-auto mb-2 h-5 w-5 opacity-60" />
                                            <p>Index is empty</p>
                                            <button
                                                type="button"
                                                onClick={onCreateDocument}
                                                className="mt-3 border border-border px-2 py-1 font-bold text-primary hover:bg-secondary"
                                            >
                                                + New document
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};
