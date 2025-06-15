
-- Enable additional OAuth providers in auth.providers if not already enabled
-- This ensures Google and GitHub OAuth can be used
-- Note: The actual provider configuration will need to be done in Supabase Dashboard

-- Update the profiles table to store additional OAuth information if needed
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Update the handle_new_user function to include avatar and provider info
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;
