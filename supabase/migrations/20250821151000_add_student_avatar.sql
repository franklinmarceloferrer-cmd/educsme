-- Add avatar_url field to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
