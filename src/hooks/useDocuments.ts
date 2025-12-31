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
    createDocument: (name?: string) => Document;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    deleteDocument: (id: string) => void;
    setActiveDocument: (id: string) => void;
    renameDocument: (id: string, name: string) => void;
    toggleFavorite: (id: string) => void;
    getRecentDocuments: (limit?: number) => Document[];
    searchDocuments: (query: string) => Document[];
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

const saveDocuments = (documents: Document[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
        console.error('Failed to save documents:', error);
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

    // Persist documents whenever they change
    useEffect(() => {
        saveDocuments(documents);
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
        setDocuments((prev) => {
            const filtered = prev.filter((doc) => doc.id !== id);

            // If we're deleting the active document, switch to another
            if (id === activeDocId && filtered.length > 0) {
                setActiveDocId(filtered[0].id);
            } else if (filtered.length === 0) {
                setActiveDocId(null);
            }

            return filtered;
        });
    }, [activeDocId]);

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
        createDocument,
        updateDocument,
        deleteDocument,
        setActiveDocument,
        renameDocument,
        toggleFavorite,
        getRecentDocuments,
        searchDocuments,
    };
};
