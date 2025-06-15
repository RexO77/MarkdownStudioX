
-- Fix security warnings by setting search_path for database functions
-- This prevents potential security issues with mutable search paths

-- Update the create_document_version function with secure search_path
CREATE OR REPLACE FUNCTION public.create_document_version(
  p_document_id UUID,
  p_content TEXT,
  p_title TEXT,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM public.document_versions
  WHERE document_id = p_document_id;

  -- Insert new version
  INSERT INTO public.document_versions (
    document_id,
    user_id,
    content,
    title,
    version_number,
    change_summary
  )
  VALUES (
    p_document_id,
    auth.uid(),
    p_content,
    p_title,
    v_version_number,
    p_change_summary
  )
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Update the handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.app_metadata->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
