-- =============================================
-- SECURITY FIX: Role protection and storage policies
-- =============================================

-- 1. Update handle_new_user to ALWAYS default to student role
-- (ignores any role passed in user metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validated_display_name text;
BEGIN
  -- Sanitize display_name with length limit (max 100 chars)
  validated_display_name := LEFT(
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    100
  );
  
  -- SECURITY: Always default to 'student' role
  -- Role elevation must be done by admins via update_user_role function
  INSERT INTO public.profiles (user_id, display_name, email, role)
  VALUES (
    NEW.id,
    validated_display_name,
    NEW.email,
    'student'  -- Always student - never trust client-supplied role
  );
  RETURN NEW;
END;
$$;

-- 2. Fix profile update policy to prevent role self-escalation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users update own non-role profile fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- 3. Create admin-only role management function
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can change roles';
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('admin', 'teacher', 'student') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Update role
  UPDATE profiles
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_user_role TO authenticated;

-- 4. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('announcements', 'announcements', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS policies for avatars bucket (public read, user-scoped write)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Storage RLS policies for documents bucket (teacher/admin managed)
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Teachers and admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);

-- 7. Storage RLS policies for announcements bucket (teacher/admin managed)
CREATE POLICY "Authenticated users can view announcement files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'announcements');

CREATE POLICY "Teachers and admins can upload announcement files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'announcements'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can update announcement files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'announcements'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can delete announcement files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'announcements'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);