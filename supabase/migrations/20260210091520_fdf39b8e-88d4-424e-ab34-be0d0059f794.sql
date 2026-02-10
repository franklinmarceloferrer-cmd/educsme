
CREATE TABLE public.study_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read study materials"
  ON public.study_materials FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert study materials"
  ON public.study_materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Staff can update study materials"
  ON public.study_materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Staff can delete study materials"
  ON public.study_materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE TRIGGER update_study_materials_updated_at
  BEFORE UPDATE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
