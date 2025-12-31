import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FileText, Star, Trash2, MoreHorizontal,
    ChevronLeft, ChevronRight, Clock, Edit2, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Document } from '@/hooks/useDocuments';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    documents: Document[];
    activeDocument: Document | null;
    onSelectDocument: (id: string) => void;
    onCreateDocument: () => void;
    onDeleteDocument: (id: string) => void;
    onRenameDocument: (id: string, name: string) => void;
    onToggleFavorite: (id: string) => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
    isOpen,
    onToggle,
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

    // Focus input when editing
    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const filteredDocuments = searchQuery
        ? documents.filter(
            (doc) =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : documents;

    const favoriteDocuments = filteredDocuments.filter((doc) => doc.isFavorite);
    const recentDocuments = [...filteredDocuments]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5);
    const otherDocuments = filteredDocuments.filter((doc) => !doc.isFavorite);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

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

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEditing();
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const DocumentItem: React.FC<{ doc: Document }> = ({ doc }) => (
        <div
            className={cn(
                'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                activeDocument?.id === doc.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/50'
            )}
            onClick={() => onSelectDocument(doc.id)}
        >
            <FileText className="h-4 w-4 shrink-0 opacity-60" />

            <div className="flex-1 min-w-0">
                {editingId === doc.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                            ref={editInputRef}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEditing}
                            className="h-6 text-sm px-1"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={saveEditing}
                        >
                            <Check className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={cancelEditing}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="font-medium text-sm truncate">{doc.name}</div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(doc.updatedAt)}
                        </div>
                    </>
                )}
            </div>

            {editingId !== doc.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'h-6 w-6 p-0',
                            doc.isFavorite && 'text-yellow-500 opacity-100'
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(doc.id);
                        }}
                    >
                        <Star className={cn('h-3 w-3', doc.isFavorite && 'fill-current')} />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(doc)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteDocument(doc.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Toggle Button (when closed) */}
            {!isOpen && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="fixed left-2 top-20 z-40 h-8 w-8 p-0 shadow-md bg-background border"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed left-0 top-16 bottom-0 z-40 w-72 bg-background border-r flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b">
                            <h2 className="font-medium text-sm">Documents</h2>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCreateDocument}
                                    className="h-7 w-7 p-0"
                                    title="New Document"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onToggle}
                                    className="h-7 w-7 p-0"
                                    title="Close Sidebar"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search documents..."
                                    className="h-8 pl-8 text-sm"
                                />
                            </div>
                        </div>

                        {/* Document List */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {/* Favorites */}
                            {favoriteDocuments.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Favorites
                                    </div>
                                    {favoriteDocuments.map((doc) => (
                                        <DocumentItem key={doc.id} doc={doc} />
                                    ))}
                                </div>
                            )}

                            {/* Recent (only when not searching) */}
                            {!searchQuery && recentDocuments.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Recent
                                    </div>
                                    {recentDocuments.map((doc) => (
                                        <DocumentItem key={`recent-${doc.id}`} doc={doc} />
                                    ))}
                                </div>
                            )}

                            {/* All Documents */}
                            {searchQuery ? (
                                <div>
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                        Search Results ({filteredDocuments.length})
                                    </div>
                                    {filteredDocuments.length === 0 ? (
                                        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                            No documents found
                                        </div>
                                    ) : (
                                        filteredDocuments.map((doc) => (
                                            <DocumentItem key={doc.id} doc={doc} />
                                        ))
                                    )}
                                </div>
                            ) : (
                                otherDocuments.length > 0 && (
                                    <div>
                                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                            All Documents
                                        </div>
                                        {otherDocuments.map((doc) => (
                                            <DocumentItem key={doc.id} doc={doc} />
                                        ))}
                                    </div>
                                )
                            )}

                            {documents.length === 0 && (
                                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No documents yet</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onCreateDocument}
                                        className="mt-2"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Create Document
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
