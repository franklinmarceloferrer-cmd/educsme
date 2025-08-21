-- Fix the foreign key relationship between documents and profiles
-- The issue: documents.uploaded_by references auth.users(id) but the API tries to join with profiles.id
-- Solution: Create a proper foreign key constraint that allows joining documents.uploaded_by with profiles.user_id

-- First, let's add a foreign key constraint that properly links documents to profiles
-- We need to create a constraint that allows PostgREST to understand the relationship

-- Drop the existing foreign key constraint on documents.uploaded_by if it exists
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;

-- Add the foreign key constraint back to auth.users (this should already exist but let's be explicit)
ALTER TABLE public.documents 
ADD CONSTRAINT documents_uploaded_by_auth_users_fkey 
FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Now create a view or update the API to handle the relationship properly
-- Since PostgREST needs a direct foreign key to do the join, we need to create one
-- But we can't directly link documents.uploaded_by to profiles.id because they reference different things

-- Instead, let's create a computed column or update the documents table structure
-- Option 1: Add a computed column that gets the profile_id for the uploaded_by user

-- Create a function to get profile id from user id
CREATE OR REPLACE FUNCTION get_profile_id_from_user_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.profiles WHERE user_id = user_uuid LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- Add a computed column to documents that gets the profile_id
-- This won't work directly with PostgREST foreign key syntax, so let's try a different approach

-- Alternative: Create a proper foreign key by adding a profile_id column to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS profile_id UUID;

-- Create a function to populate the profile_id column
CREATE OR REPLACE FUNCTION populate_documents_profile_id()
RETURNS void AS $$
BEGIN
  UPDATE public.documents 
  SET profile_id = (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.user_id = documents.uploaded_by
  )
  WHERE profile_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the function to populate existing records
SELECT populate_documents_profile_id();

-- Add the foreign key constraint
ALTER TABLE public.documents 
ADD CONSTRAINT documents_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create a trigger to automatically set profile_id when a document is inserted or updated
CREATE OR REPLACE FUNCTION set_document_profile_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_id = (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.user_id = NEW.uploaded_by
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for insert and update
DROP TRIGGER IF EXISTS set_document_profile_id_on_insert ON public.documents;
CREATE TRIGGER set_document_profile_id_on_insert
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION set_document_profile_id();

DROP TRIGGER IF EXISTS set_document_profile_id_on_update ON public.documents;
CREATE TRIGGER set_document_profile_id_on_update
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  WHEN (OLD.uploaded_by IS DISTINCT FROM NEW.uploaded_by)
  EXECUTE FUNCTION set_document_profile_id();

-- Update RLS policies to account for the new column
-- The existing policies should still work, but let's make sure they're comprehensive

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON public.documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
