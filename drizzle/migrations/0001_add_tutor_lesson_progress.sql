ALTER TABLE public.saved_tutor_lessons ADD COLUMN progress jsonb NOT NULL DEFAULT '{}'::jsonb;
GRANT UPDATE (progress) ON public.saved_tutor_lessons TO authenticated;
CREATE POLICY "Users update own lesson progress" ON public.saved_tutor_lessons FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);