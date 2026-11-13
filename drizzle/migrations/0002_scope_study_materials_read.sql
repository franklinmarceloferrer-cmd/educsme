DROP POLICY IF EXISTS "Authenticated users can read study materials" ON public.study_materials;
CREATE POLICY "School members can read study materials" ON public.study_materials
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = ANY (ARRAY['student','teacher','admin'])));