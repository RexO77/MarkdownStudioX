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

export interface UseDocumentsReturn {
    documents: Document[];
    activeDocument: Document | null;
    saveFailed: boolean;
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

const loadDocuments = (): Document[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load documents:', error);
    }
    return [];
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
    const [documents, setDocuments] = useState<Document[]>(() => loadDocuments());
    const [activeDocId, setActiveDocId] = useState<string | null>(() => loadActiveDocId());
    const [saveFailed, setSaveFailed] = useState(false);

    // Migrate existing content if no documents exist
    useEffect(() => {
        if (documents.length === 0) {
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
    }, [documents.length]);

    // Persist documents whenever they change; the statusline reports this write
    useEffect(() => {
        setSaveFailed(!saveDocuments(documents));
    }, [documents]);

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
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
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
