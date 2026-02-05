-- Tabela de convites para estudantes
CREATE TABLE public.student_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  student_id TEXT,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validacao de status via trigger (evita CHECK constraint issues)
CREATE OR REPLACE FUNCTION public.validate_invite_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'accepted', 'expired', 'revoked') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_student_invite_status
  BEFORE INSERT OR UPDATE ON public.student_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_invite_status();

-- Habilitar RLS
ALTER TABLE public.student_invites ENABLE ROW LEVEL SECURITY;

-- Policies: Staff pode gerenciar convites
CREATE POLICY "Staff can view invites" ON public.student_invites
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
  ));

CREATE POLICY "Staff can create invites" ON public.student_invites
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
  ));

CREATE POLICY "Staff can update invites" ON public.student_invites
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
  ));

CREATE POLICY "Staff can delete invites" ON public.student_invites
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
  ));

-- Policy para usuarios anonimos validarem token
CREATE POLICY "Anyone can validate pending invite token" ON public.student_invites
  FOR SELECT TO anon
  USING (status = 'pending' AND expires_at > now());

-- Trigger para updated_at
CREATE TRIGGER update_student_invites_updated_at
  BEFORE UPDATE ON public.student_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();