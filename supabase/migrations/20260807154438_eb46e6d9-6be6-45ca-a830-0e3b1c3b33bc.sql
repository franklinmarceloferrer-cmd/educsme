-- 1. Storage: announcements bucket
DROP POLICY IF EXISTS "Authenticated users can view announcement files" ON storage.objects;
CREATE POLICY "Staff or published announcement files are viewable"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'announcements'
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = ANY (ARRAY['teacher','admin'])
    )
    OR EXISTS (
      SELECT 1 FROM public.announcements a
      WHERE a.is_published = true
        AND position(storage.objects.name in a.content) > 0
    )
  )
);

-- 2. Storage: documents bucket
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "Documents viewable by staff, owner, or if public"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = ANY (ARRAY['teacher','admin'])
    )
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE (d.is_public = true OR d.uploaded_by = auth.uid())
        AND (d.file_url = storage.objects.name OR d.file_url = 'documents/' || storage.objects.name OR right(d.file_url, length(storage.objects.name) + 1) = '/' || storage.objects.name)
    )
  )
);

-- 3. student_invites: remove anonymous enumeration
DROP POLICY IF EXISTS "Anyone can validate pending invite token" ON public.student_invites;
REVOKE ALL ON public.student_invites FROM anon;

-- 4. SECURITY DEFINER function exposure
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.update_user_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_role_count(role_name text)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cnt integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = ANY (ARRAY['teacher','admin'])
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF role_name NOT IN ('admin','teacher','student') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  SELECT COUNT(*)::integer INTO cnt FROM public.profiles WHERE role = role_name;
  RETURN cnt;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_role_count(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_role_count(text) TO authenticated;