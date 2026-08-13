DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;

CREATE POLICY "Avatars viewable by staff owner or subject"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = ANY (ARRAY['teacher'::text, 'admin'::text])
    )
    OR EXISTS (
      SELECT 1
      FROM public.students s
      JOIN public.profiles p ON p.user_id = auth.uid()
      WHERE s.email = p.email
        AND (storage.foldername(name))[1] = s.id::text
    )
  )
);