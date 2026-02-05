

## Plano: Sistema de Convites para Estudantes

### Visao Geral
Implementar um sistema completo que permite a administradores e professores convidar estudantes para a plataforma EduCMS. O estudante recebe um link exclusivo para criar sua conta com dados pre-preenchidos.

---

### Arquitetura do Sistema

```text
+------------------+     +-------------------+     +------------------+
|  Admin/Teacher   | --> | student_invites   | --> | Link de Convite  |
|  (Convida)       |     | (tabela)          |     | (Copiavel)       |
+------------------+     +-------------------+     +------------------+
                                                          |
                                                          v
                               +------------------------------------------+
                               | Estudante acessa /invite/:token         |
                               | - Ve dados pre-preenchidos              |
                               | - Cria senha                            |
                               | - Conta + registro student criados      |
                               +------------------------------------------+
```

---

### 1. Database Migration

**Criar tabela `student_invites`:**

```sql
-- Tabela de convites
CREATE TABLE public.student_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  student_id TEXT,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Policy publica para validar token (anon users)
CREATE POLICY "Anyone can validate invite token" ON public.student_invites
  FOR SELECT TO anon
  USING (token = token AND status = 'pending' AND expires_at > now());

-- Trigger para updated_at
CREATE TRIGGER update_student_invites_updated_at
  BEFORE UPDATE ON public.student_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. Edge Function: `accept-student-invite`

**Arquivo:** `supabase/functions/accept-student-invite/index.ts`

Esta funcao sera chamada quando o estudante aceitar o convite e criar sua conta:

- Validar token (existe, nao expirado, status pending)
- Criar usuario no auth.users via Supabase Admin
- O trigger `handle_new_user` cria o profile automaticamente
- Criar registro na tabela `students`
- Marcar convite como `accepted`

```typescript
// Estrutura:
// 1. Receber { token, password }
// 2. Validar token
// 3. Criar usuario com supabase.auth.admin.createUser()
// 4. Criar student record
// 5. Atualizar invite status para 'accepted'
// 6. Retornar sucesso
```

---

### 3. Novos Componentes Frontend

#### 3.1 `InviteStudentDialog.tsx`
- Formulario: email, nome, grade, section, student_id (opcional)
- Botao "Criar Convite"
- Apos criar, exibe link copiavel
- Validacao com Zod

#### 3.2 `PendingInvitesList.tsx`
- Tabela com convites pendentes
- Colunas: Nome, Email, Grade, Status, Expira em, Acoes
- Acoes: Copiar Link, Reenviar, Revogar

#### 3.3 `InviteLinkCopyDialog.tsx`
- Modal que exibe o link de convite apos criacao
- Botao para copiar link
- Instrucoes para enviar ao estudante

---

### 4. Nova Pagina: `AcceptInvite.tsx`

**Rota:** `/invite/:token` (publica, sem autenticacao)

- Validar token via query
- Se valido: mostrar formulario com dados pre-preenchidos
- Estudante so precisa criar senha
- Submit: chamar edge function `accept-student-invite`
- Sucesso: redirecionar para login com mensagem

---

### 5. Atualizacoes em Arquivos Existentes

#### 5.1 `src/App.tsx`
Adicionar rota publica:
```tsx
<Route path="/invite/:token" element={<AcceptInvite />} />
```

#### 5.2 `src/pages/Students.tsx`
- Adicionar botao "Convidar Estudante" ao lado de "Add Student"
- Adicionar tab ou secao colapsavel para "Convites Pendentes"

#### 5.3 `src/lib/supabaseApi.ts`
Adicionar `invitesApi`:
```typescript
export const invitesApi = {
  getAll: async () => { /* lista convites */ },
  create: async (data) => { /* cria convite */ },
  revoke: async (id) => { /* status = 'revoked' */ },
  validateToken: async (token) => { /* valida token */ },
  getByToken: async (token) => { /* busca convite por token */ },
};
```

---

### 6. Interface do Convite

**Interface TypeScript:**
```typescript
export interface StudentInvite {
  id: string;
  email: string;
  student_id: string | null;
  name: string;
  grade: string;
  section: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### 7. Fluxo Completo

```text
1. Admin/Teacher acessa /students
2. Clica em "Convidar Estudante"
3. Preenche: email, nome, grade, section
4. Sistema cria convite no banco
5. Modal exibe link: educsme.lovable.app/invite/{token}
6. Admin copia e envia link (WhatsApp, email pessoal, etc.)
7. Estudante acessa o link
8. Ve seus dados pre-preenchidos
9. Cria uma senha
10. Sistema:
    - Cria conta via edge function (auth.admin.createUser)
    - Cria registro em students
    - Marca convite como aceito
11. Estudante e redirecionado para /login
12. Estudante faz login e acessa o dashboard
```

---

### 8. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| Migration SQL | Criar tabela `student_invites` |
| `supabase/functions/accept-student-invite/index.ts` | Edge function |
| `src/pages/AcceptInvite.tsx` | Pagina publica de aceitar convite |
| `src/components/students/InviteStudentDialog.tsx` | Dialog para convidar |
| `src/components/students/PendingInvitesList.tsx` | Lista de convites |
| `src/components/students/InviteLinkCopyDialog.tsx` | Dialog com link copiavel |

### 9. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rota `/invite/:token` |
| `src/pages/Students.tsx` | Adicionar botao e secao de convites |
| `src/lib/supabaseApi.ts` | Adicionar `invitesApi` |

---

### Consideracoes de Seguranca

1. **Tokens UUID** - Dificeis de adivinhar
2. **Expiracao de 7 dias** - Convites nao ficam validos eternamente
3. **RLS policies** - Apenas staff pode criar/ver convites
4. **Edge function com service role** - Permite criar usuarios sem expor service key
5. **Validacao de email duplicado** - Verificar antes de criar convite
6. **Revogacao** - Staff pode cancelar convites pendentes

---

### Nota sobre Email

Como **nao ha RESEND_API_KEY configurada**, o sistema usara **links manuais**:
- Admin/Teacher copia o link de convite
- Envia por WhatsApp, email pessoal, ou outro meio
- Isso evita dependencia de servico de email externo

Se desejar envio automatico de emails no futuro, basta configurar o Resend e adicionar uma chamada na edge function.

