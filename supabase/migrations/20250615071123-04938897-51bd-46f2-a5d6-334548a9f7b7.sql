
-- Create indexes for foreign keys to improve query performance

-- Index for document_versions.document_id foreign key
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id 
ON public.document_versions (document_id);

-- Index for document_versions.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_document_versions_user_id 
ON public.document_versions (user_id);

-- Index for documents.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
ON public.documents (user_id);

-- Additional composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_document_versions_document_user 
ON public.document_versions (document_id, user_id);
