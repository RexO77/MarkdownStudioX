
-- Drop existing policies and recreate them with optimized auth function calls

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Documents table policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

-- Document versions table policies
DROP POLICY IF EXISTS "Users can view their own document versions" ON public.document_versions;
DROP POLICY IF EXISTS "Users can create their own document versions" ON public.document_versions;

-- Recreate optimized policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = id);

-- Recreate optimized policies for documents table
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own documents" 
  ON public.documents 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON public.documents 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Recreate optimized policies for document_versions table
CREATE POLICY "Users can view their own document versions" 
  ON public.document_versions 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own document versions" 
  ON public.document_versions 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);
