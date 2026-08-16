import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Pencil, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/hooks/useDocuments';
import { countWords } from '@/lib/text-stats';
import {
    Bar,
    DURATION,
    EASE,
    ICON,
    IconButton,
    Label,
    LabelButton,
    ROW_ACTION_INSET,
    ROW_GUTTER,
    SectionRule,
} from '@/components/chrome';

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

/** 3 × 24px row buttons + the 6px inset they sit at. */
const ROW_ACTIONS_RESERVE = 'pr-[78px]';

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
        const meta = `${formatDate(doc.updatedAt)} · ${countWords(doc.content)} words`;

        return (
            <div
                key={doc.id}
                className={cn(
                    'group relative border-b border-border',
                    isActive ? 'bg-foreground text-background' : 'hover:bg-secondary'
                )}
            >
                {isEditing ? (
                    <div className={cn('py-2', ROW_GUTTER)}>
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
                        <Label
                            className={cn(
                                'mt-1 block',
                                isActive ? 'text-background/70' : 'text-muted-foreground'
                            )}
                        >
                            {meta}
                        </Label>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onSelectDocument(doc.id)}
                            className={cn('flex w-full flex-col gap-1 py-2 text-left', ROW_GUTTER, ROW_ACTIONS_RESERVE)}
                        >
                            <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold">
                                <span className="min-w-0 truncate leading-none">{doc.name}</span>
                                {doc.isFavorite && (
                                    <Star
                                        className={cn(
                                            'h-2.5 w-2.5 shrink-0 fill-current',
                                            isActive ? 'text-background/80' : 'text-primary'
                                        )}
                                    />
                                )}
                            </span>
                            <Label className={isActive ? 'text-background/70' : 'text-muted-foreground'}>
                                {meta}
                            </Label>
                        </button>

                        <div
                            className={cn(
                                'absolute top-1/2 flex -translate-y-1/2 items-center opacity-0 transition-opacity',
                                ROW_ACTION_INSET,
                                'group-hover:opacity-100 focus-within:opacity-100',
                                '[@media(hover:none)]:opacity-100'
                            )}
                        >
                            <IconButton
                                size="row"
                                label={doc.isFavorite ? 'Remove star' : 'Star document'}
                                side="right"
                                onClick={() => onToggleFavorite(doc.id)}
                                className={cn(
                                    isActive
                                        ? 'text-background/70 hover:bg-transparent hover:text-background'
                                        : 'hover:bg-transparent hover:text-primary'
                                )}
                            >
                                <Star className={cn(ICON.sm, doc.isFavorite && 'fill-current')} />
                            </IconButton>
                            <IconButton
                                size="row"
                                label="Rename document"
                                side="right"
                                onClick={() => startEditing(doc)}
                                className={cn(
                                    isActive
                                        ? 'text-background/70 hover:bg-transparent hover:text-background'
                                        : 'hover:bg-transparent hover:text-foreground'
                                )}
                            >
                                <Pencil className={ICON.sm} />
                            </IconButton>
                            <IconButton
                                size="row"
                                label="Delete document"
                                side="right"
                                onClick={() => onDeleteDocument(doc.id)}
                                className={cn(
                                    isActive
                                        ? 'text-background/70 hover:bg-transparent hover:text-background'
                                        : 'hover:bg-transparent hover:text-destructive'
                                )}
                            >
                                <Trash2 className={ICON.sm} />
                            </IconButton>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence initial={false}>
            {/* Slid in by margin, not squeezed by width: an interrupted or
                throttled width animation leaves the index clipped at an
                arbitrary size, and every frame of it reflows the rows. */}
            {isOpen && (
                <motion.aside
                    initial={{ marginLeft: -SIDEBAR_WIDTH }}
                    animate={{ marginLeft: 0 }}
                    exit={{ marginLeft: -SIDEBAR_WIDTH, transition: { duration: DURATION.exit, ease: EASE } }}
                    transition={{ duration: DURATION.enter, ease: EASE }}
                    style={{ width: SIDEBAR_WIDTH }}
                    className="h-full shrink-0 border-r border-border bg-background"
                >
                    <div className="flex h-full flex-col">
                        {/* Index head — the same 36px track as the editor toolbar beside it */}
                        <Bar track="toolbar" stretch flush>
                            <span className={cn('flex items-center text-muted-foreground', ROW_GUTTER)}>
                                <Label weight="strong">Index</Label>
                            </span>
                            <LabelButton
                                fill
                                tone="accent"
                                onClick={onCreateDocument}
                                className="border-l border-border"
                            >
                                New
                            </LabelButton>
                        </Bar>

                        {/* grep */}
                        <Bar track="field" flush rule="bottom">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="grep documents…"
                                aria-label="Search documents"
                                className={cn(
                                    'h-full w-full bg-transparent font-mono text-[12px]',
                                    ROW_GUTTER,
                                    'placeholder:text-muted-foreground/70 focus:outline-none'
                                )}
                            />
                        </Bar>

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
                                <div className={cn('py-10 text-center', ROW_GUTTER)}>
                                    {searchQuery ? (
                                        <>
                                            <Label className="block text-muted-foreground">
                                                No matches for “{searchQuery}”
                                            </Label>
                                            <LabelButton
                                                tone="accent"
                                                onClick={() => setSearchQuery('')}
                                                className="mt-3 border border-border"
                                            >
                                                Clear search
                                            </LabelButton>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mx-auto mb-2 h-5 w-5 text-muted-foreground opacity-60" />
                                            <Label className="block text-muted-foreground">Index is empty</Label>
                                            <LabelButton
                                                tone="accent"
                                                onClick={onCreateDocument}
                                                className="mt-3 border border-border"
                                            >
                                                New document
                                            </LabelButton>
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
