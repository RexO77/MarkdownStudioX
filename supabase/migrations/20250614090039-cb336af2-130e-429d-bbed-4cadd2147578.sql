
-- Drop existing policies if they exist and recreate them to ensure consistency
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own document versions" ON public.document_versions;
DROP POLICY IF EXISTS "Users can create their own document versions" ON public.document_versions;

-- Enable Row Level Security on both tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents table
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
  ON public.documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON public.documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for document_versions table
CREATE POLICY "Users can view their own document versions" 
  ON public.document_versions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document versions" 
  ON public.document_versions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
