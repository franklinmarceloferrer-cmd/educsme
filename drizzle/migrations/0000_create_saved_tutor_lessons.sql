CREATE TABLE public.saved_tutor_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  subject text,
  prompt text NOT NULL,
  lesson jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.saved_tutor_lessons TO authenticated;
GRANT ALL ON public.saved_tutor_lessons TO service_role;
ALTER TABLE public.saved_tutor_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own saved lessons" ON public.saved_tutor_lessons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users save own lessons" ON public.saved_tutor_lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved lessons" ON public.saved_tutor_lessons FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX saved_tutor_lessons_user_idx ON public.saved_tutor_lessons(user_id, created_at DESC);