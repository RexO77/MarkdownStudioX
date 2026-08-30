import { useState, useCallback, useEffect } from 'react';

export interface Document {
    id: string;
    name: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    isFavorite?: boolean;
}

const STORAGE_KEY = 'markdown-studio-documents';
const ACTIVE_DOC_KEY = 'markdown-studio-active-doc';
const TOMBSTONES_KEY = 'markdown-studio-document-tombstones';

/**
 * A tombstone only has to outlive the next sync of every connected target.
 * Keeping the most recent few hundred is far past that, and the bound matters:
 * this list shares the localStorage quota with the documents themselves, so an
 * unbounded one would eventually fail the write and surface to the writer as
 * their own work failing to save.
 */
const MAX_TOMBSTONES = 500;

/** Sets keep insertion order, so the oldest tombstones sit at the front. */
const capTombstones = (ids: Set<string>): Set<string> => {
    while (ids.size > MAX_TOMBSTONES) {
        const oldest: string = ids.values().next().value;
        ids.delete(oldest);
    }
    return ids;
};

export interface StorageRecovery {
    reason: string;
    rawPayload: string | null;
}

type DocumentLoadResult =
    | { status: 'ready'; documents: Document[] }
    | { status: 'recovery'; documents: []; recovery: StorageRecovery };

export interface UseDocumentsReturn {
    documents: Document[];
    activeDocument: Document | null;
    saveFailed: boolean;
    storageRecovery: StorageRecovery | null;
    deletedDocumentIds: ReadonlySet<string>;
    startNewLibrary: () => void;
    createDocument: (name?: string) => Document;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    deleteDocument: (id: string) => void;
    setActiveDocument: (id: string) => void;
    renameDocument: (id: string, name: string) => void;
    toggleFavorite: (id: string) => void;
    getRecentDocuments: (limit?: number) => Document[];
    searchDocuments: (query: string) => Document[];
    applySyncChanges: (changes: { updated: Document[]; imported: Document[] }) => void;
}

const generateId = (): string => {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const isDocument = (value: unknown): value is Document => {
    if (!value || typeof value !== 'object') return false;
    const document = value as Record<string, unknown>;
    return (
        typeof document.id === 'string' && document.id.length > 0 &&
        typeof document.name === 'string' &&
        typeof document.content === 'string' &&
        typeof document.createdAt === 'number' && Number.isFinite(document.createdAt) &&
        typeof document.updatedAt === 'number' && Number.isFinite(document.updatedAt) &&
        (document.isFavorite === undefined || typeof document.isFavorite === 'boolean')
    );
};

export const loadDocumentLibrary = (): DocumentLoadResult => {
    let stored: string | null = null;
    try {
        stored = localStorage.getItem(STORAGE_KEY);
        if (stored === null) return { status: 'ready', documents: [] };
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed) || !parsed.every(isDocument)) {
            return {
                status: 'recovery',
                documents: [],
                recovery: { reason: 'The saved document library has an unexpected shape.', rawPayload: stored },
            };
        }
        return { status: 'ready', documents: parsed };
    } catch (error) {
        console.error('Failed to load documents:', error);
        return {
            status: 'recovery',
            documents: [],
            recovery: {
                reason: error instanceof Error ? error.message : 'The saved document library could not be read.',
                rawPayload: stored,
            },
        };
    }
};

const loadTombstones = (): Set<string> => {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(TOMBSTONES_KEY) ?? '[]');
        return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')
            ? capTombstones(new Set(parsed))
            : new Set();
    } catch {
        return new Set();
    }
};

const saveDocuments = (documents: Document[]): boolean => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
        return true;
    } catch (error) {
        console.error('Failed to save documents:', error);
        return false;
    }
};

const loadActiveDocId = (): string | null => {
    try {
        return localStorage.getItem(ACTIVE_DOC_KEY);
    } catch {
        return null;
    }
};

const saveActiveDocId = (id: string | null) => {
    try {
        if (id) {
            localStorage.setItem(ACTIVE_DOC_KEY, id);
        } else {
            localStorage.removeItem(ACTIVE_DOC_KEY);
        }
    } catch (error) {
        console.error('Failed to save active document ID:', error);
    }
};

export const useDocuments = (): UseDocumentsReturn => {
    const [loadResult, setLoadResult] = useState<DocumentLoadResult>(() => loadDocumentLibrary());
    const [documents, setDocuments] = useState<Document[]>(loadResult.documents);
    const [activeDocId, setActiveDocId] = useState<string | null>(() => loadActiveDocId());
    const [saveFailed, setSaveFailed] = useState(false);
    const [deletedDocumentIds, setDeletedDocumentIds] = useState<Set<string>>(() => loadTombstones());

    // Migrate existing content if no documents exist
    useEffect(() => {
        if (loadResult.status === 'ready' && documents.length === 0) {
            const legacyContent = localStorage.getItem('markdown-content');
            if (legacyContent && legacyContent.trim()) {
                const newDoc: Document = {
                    id: generateId(),
                    name: 'Untitled Document',
                    content: legacyContent,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                setDocuments([newDoc]);
                setActiveDocId(newDoc.id);
                saveDocuments([newDoc]);
                saveActiveDocId(newDoc.id);
            }
        }
    }, [documents.length, loadResult.status]);

    // Persist documents whenever they change; the statusline reports this write
    useEffect(() => {
        if (loadResult.status !== 'ready') return;
        setSaveFailed(!saveDocuments(documents));
    }, [documents, loadResult.status]);

    useEffect(() => {
        if (loadResult.status !== 'ready') return;
        try {
            localStorage.setItem(TOMBSTONES_KEY, JSON.stringify([...deletedDocumentIds]));
        } catch (error) {
            console.error('Failed to save deletion tombstones:', error);
            setSaveFailed(true);
        }
    }, [deletedDocumentIds, loadResult.status]);

    // Persist active document ID
    useEffect(() => {
        saveActiveDocId(activeDocId);
    }, [activeDocId]);

    const activeDocument = documents.find((doc) => doc.id === activeDocId) || null;

    const createDocument = useCallback((name?: string): Document => {
        const newDoc: Document = {
            id: generateId(),
            name: name || `Untitled ${documents.length + 1}`,
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setDocuments((prev) => [newDoc, ...prev]);
        setActiveDocId(newDoc.id);
        return newDoc;
    }, [documents.length]);

    const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === id
                    ? { ...doc, ...updates, updatedAt: Date.now() }
                    : doc
            )
        );
    }, []);

    const deleteDocument = useCallback((id: string) => {
        setDeletedDocumentIds((prev) => capTombstones(new Set(prev).add(id)));
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }, []);

    const startNewLibrary = useCallback(() => {
        if (!saveDocuments([])) {
            setSaveFailed(true);
            return;
        }
        setDocuments([]);
        setDeletedDocumentIds(new Set());
        setLoadResult({ status: 'ready', documents: [] });
        setActiveDocId(null);
    }, []);

    // Keep the active id valid after any deletion. Computed from the
    // documents result rather than from inside the updater, so React
    // StrictMode double-invokes cannot fire this side effect twice.
    useEffect(() => {
        if (documents.length === 0) {
            if (activeDocId !== null) setActiveDocId(null);
        } else if (!documents.some((doc) => doc.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    const setActiveDocument = useCallback((id: string) => {
        if (documents.some((doc) => doc.id === id)) {
            setActiveDocId(id);
        }
    }, [documents]);

    const renameDocument = useCallback((id: string, name: string) => {
        updateDocument(id, { name });
    }, [updateDocument]);

    const toggleFavorite = useCallback((id: string) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
            )
        );
    }, []);

    // Folder/Drive sync merges: apply file-side documents without bumping
    // updatedAt (that would make a pull look like a local edit). Skip a
    // replacement when the in-memory document is newer than the outcome —
    // the user edited after the sync snapshot was taken.
    const applySyncChanges = useCallback(
        (changes: { updated: Document[]; imported: Document[] }) => {
            setDocuments((prev) => {
                const updatedById = new Map(changes.updated.map((doc) => [doc.id, doc]));
                const merged = prev.map((doc) => {
                    const incoming = updatedById.get(doc.id);
                    if (!incoming) return doc;
                    return doc.updatedAt > incoming.updatedAt ? doc : incoming;
                });
                const existingIds = new Set(prev.map((doc) => doc.id));
                const fresh = changes.imported.filter((doc) => !existingIds.has(doc.id));
                return fresh.length ? [...fresh, ...merged] : merged;
            });
        },
        []
    );

    const getRecentDocuments = useCallback((limit: number = 5): Document[] => {
        return [...documents]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, limit);
    }, [documents]);

    const searchDocuments = useCallback((query: string): Document[] => {
        const lowerQuery = query.toLowerCase();
        return documents.filter(
            (doc) =>
                doc.name.toLowerCase().includes(lowerQuery) ||
                doc.content.toLowerCase().includes(lowerQuery)
        );
    }, [documents]);

    return {
        documents,
        activeDocument,
        saveFailed,
        storageRecovery: loadResult.status === 'recovery' ? loadResult.recovery : null,
        deletedDocumentIds,
        startNewLibrary,
        createDocument,
        updateDocument,
        deleteDocument,
        setActiveDocument,
        renameDocument,
        toggleFavorite,
        getRecentDocuments,
        searchDocuments,
        applySyncChanges,
    };
};
