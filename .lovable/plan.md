

## Plano: Pagina de Perfil do Estudante

### Visao Geral
Criar uma pagina de perfil que permite aos estudantes visualizar e editar suas informacoes pessoais. A pagina sera acessivel tanto para estudantes (com edicao limitada) quanto para staff (admin/teacher com edicao completa).

---

### Arquitetura da Pagina

```text
+--------------------------------------------------+
|  [Avatar]                                        |
|   Nome do Estudante                              |
|   ID: STU001 | Grade: 10th | Section: A          |
+--------------------------------------------------+
|                                                  |
|  INFORMACOES PESSOAIS                            |
|  +--------------------+  +--------------------+  |
|  | Email              |  | Telefone           |  |
|  | john@example.com   |  | +1 234 567 8900    |  |
|  +--------------------+  +--------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | Endereco                                   |  |
|  | 123 Main Street, City                      |  |
|  +--------------------------------------------+  |
|                                                  |
|  INFORMACOES ACADEMICAS                          |
|  +--------------------+  +--------------------+  |
|  | Data de Matricula  |  | Status             |  |
|  | 15/03/2024         |  | Ativo              |  |
|  +--------------------+  +--------------------+  |
|                                                  |
|  [Editar Perfil]                                 |
|                                                  |
+--------------------------------------------------+
```

---

### 1. Nova Pagina: `src/pages/StudentProfile.tsx`

**Funcionalidades:**

1. **Visualizacao do Perfil**
   - Avatar com opcao de upload (usando componente existente `StudentAvatarUpload`)
   - Informacoes pessoais: nome, email, telefone, endereco
   - Informacoes academicas: student_id, grade, section, enrollment_date, status
   - Layout responsivo com cards organizados

2. **Edicao do Perfil**
   - Dialog/modal para edicao (similar ao `StudentFormDialog`)
   - Estudantes podem editar: telefone, endereco
   - Staff pode editar: todos os campos (nome, email, grade, section, status, etc.)

3. **Busca do Registro do Estudante**
   - Para estudantes: busca pelo email do perfil autenticado
   - Para staff: pode acessar qualquer perfil via parametro de URL

---

### 2. Atualizacoes na API

**Arquivo:** `src/lib/supabaseApi.ts`

Adicionar novo metodo no `studentsApi`:

```typescript
// Buscar estudante pelo email (para o proprio estudante)
getByEmail: async (email: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

// Buscar estudante por ID
getById: async (id: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}
```

---

### 3. Novo Componente: `StudentProfileEditDialog.tsx`

**Arquivo:** `src/components/students/StudentProfileEditDialog.tsx`

- Reutiliza a estrutura do `StudentFormDialog`
- Adapta os campos editaveis baseado no role do usuario
- Estudantes: apenas telefone e endereco
- Staff: todos os campos

---

### 4. Atualizacoes no Roteamento

**Arquivo:** `src/App.tsx`

```typescript
// Adicionar novas rotas
<Route path="/profile" element={
  <ProtectedRoute>
    <AppLayout>
      <StudentProfile />
    </AppLayout>
  </ProtectedRoute>
} />

<Route path="/students/:id" element={
  <ProtectedRoute>
    <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
      <AppLayout>
        <StudentProfile />
      </AppLayout>
    </RoleProtectedRoute>
  </ProtectedRoute>
} />
```

---

### 5. Atualizacoes na Navegacao

**Arquivo:** `src/components/layout/AppSidebar.tsx`

Adicionar link "Meu Perfil" para estudantes:

```typescript
{
  title: "My Profile",
  url: "/profile",
  icon: User,
  studentOnly: true, // Apenas para estudantes
}
```

**Arquivo:** `src/pages/Students.tsx`

Adicionar link para ver perfil individual na tabela:

```typescript
// Na coluna de acoes, adicionar botao de "Ver Perfil"
<Button onClick={() => navigate(`/students/${student.id}`)}>
  <Eye className="h-4 w-4" />
</Button>
```

---

### 6. Componentes da Pagina de Perfil

**Secoes:**

1. **Header do Perfil**
   - Avatar grande com opcao de edicao
   - Nome e informacoes basicas
   - Badge de status

2. **Card de Informacoes Pessoais**
   - Email (somente leitura para estudantes)
   - Telefone (editavel)
   - Endereco (editavel)

3. **Card de Informacoes Academicas**
   - Student ID (somente leitura)
   - Grade e Section
   - Data de matricula
   - Status (badge colorido)

4. **Acoes**
   - Botao "Editar Perfil" abre dialog de edicao
   - Feedback visual ao salvar

---

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/StudentProfile.tsx` | Pagina principal do perfil |
| `src/components/students/StudentProfileEditDialog.tsx` | Dialog de edicao do perfil |
| `src/components/students/ProfileInfoCard.tsx` | Card reutilizavel para informacoes |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas `/profile` e `/students/:id` |
| `src/components/layout/AppSidebar.tsx` | Adicionar link "Meu Perfil" |
| `src/lib/supabaseApi.ts` | Adicionar `getByEmail` e `getById` no studentsApi |
| `src/pages/Students.tsx` | Adicionar link para perfil na tabela |

---

### Fluxo de Uso

**Para Estudantes:**
1. Estudante faz login
2. Clica em "Meu Perfil" no sidebar
3. Ve suas informacoes
4. Pode editar telefone e endereco
5. Salva alteracoes

**Para Staff:**
1. Staff acessa pagina de estudantes
2. Clica em "Ver Perfil" de um estudante
3. Acessa `/students/:id`
4. Ve todas as informacoes
5. Pode editar qualquer campo

---

### Consideracoes de Seguranca

1. **RLS ja configurada** - Estudantes so podem ver seu proprio registro (via email match)
2. **Edicao limitada** - Frontend restringe campos editaveis por role
3. **Validacao de dados** - Zod schema para validar inputs
4. **Permissoes de rota** - RoleProtectedRoute para rotas de staff

---

### Design Visual

- Usar componentes UI existentes (Card, Badge, Avatar, Dialog)
- Seguir paleta de cores brand-red e brand-blue
- Layout responsivo com grid
- Estados de loading com skeletons
- Feedback visual com toast ao salvar

