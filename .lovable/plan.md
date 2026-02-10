

# Conteudos de Estudo GCSE - Sistema de Conteudo Proprio

## Objetivo
Criar um sistema onde a equipe da escola (admin/teacher) pode criar e gerenciar conteudos de estudo para cada topico GCSE, e os estudantes podem acessar esses materiais diretamente no sistema.

## Visao Geral da Solucao

O sistema tera tres partes principais:
1. **Banco de dados** para armazenar os conteudos de estudo
2. **Interface de gestao** para admin/teacher criar e editar conteudos
3. **Interface de leitura** para estudantes acessarem os materiais

---

## 1. Banco de Dados

### Nova tabela: `study_materials`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador unico |
| subject | text | Materia (Mathematics, English Language, etc.) |
| topic | text | Topico (Number & Algebra, Creative Writing, etc.) |
| title | text | Titulo do conteudo |
| content | text | Conteudo em HTML (editor rich text) |
| order_index | integer | Ordem de exibicao |
| created_by | uuid | Referencia ao perfil do autor |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

### Politicas RLS
- **SELECT**: Todos os usuarios autenticados podem ler
- **INSERT/UPDATE/DELETE**: Apenas admin e teacher

---

## 2. Interface de Gestao (Admin/Teacher)

### Nova pagina: `/gcse-content-manage`
- Acessivel via sidebar para roles admin e teacher
- Lista todos os conteudos agrupados por materia e topico
- Botao para adicionar novo conteudo
- Dialog/modal com formulario:
  - Selecionar materia (dropdown com as 6 materias)
  - Selecionar topico (dropdown filtrado pela materia)
  - Titulo do conteudo
  - Editor rich text (TipTap, ja instalado no projeto) para o corpo do conteudo
- Opcoes de editar e excluir conteudos existentes

---

## 3. Interface do Estudante

### Atualizacao do StudyGrid
- Cada topico na grade de estudos tera um indicador visual mostrando se ha conteudos disponiveis
- Ao clicar em um topico, abre uma pagina/modal com a lista de materiais daquele topico
- Cada material exibe o titulo e o conteudo formatado

### Nova pagina: `/gcse-study/:subject/:topic`
- Exibe todos os materiais de estudo do topico selecionado
- Navegacao lateral entre topicos da mesma materia
- Conteudo renderizado com sanitizacao HTML (DOMPurify, ja instalado)

---

## 4. Arquivos a Criar/Modificar

### Novos arquivos:
- `src/pages/GCSEContentManage.tsx` - Pagina de gestao de conteudos
- `src/pages/GCSEStudyTopic.tsx` - Pagina de leitura do estudante
- `src/components/gcse/StudyMaterialForm.tsx` - Formulario de criacao/edicao
- `src/components/gcse/StudyMaterialList.tsx` - Lista de materiais por topico

### Arquivos modificados:
- `src/components/gcse/StudyGrid.tsx` - Adicionar links clicaveis nos topicos e indicador de conteudo
- `src/components/layout/AppSidebar.tsx` - Adicionar link "Manage GCSE Content" para admin/teacher
- `src/App.tsx` - Adicionar novas rotas
- `src/lib/supabaseApi.ts` - Adicionar funcoes de API para study_materials

---

## Secao Tecnica

### Migracao SQL
```sql
CREATE TABLE public.study_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler
CREATE POLICY "Authenticated users can read study materials"
  ON public.study_materials FOR SELECT
  TO authenticated USING (true);

-- Admin e teacher podem inserir
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

-- Admin e teacher podem atualizar
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

-- Admin e teacher podem deletar
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
```

### Stack utilizada
- **TipTap** (ja instalado) para editor rich text
- **DOMPurify** (ja instalado) para sanitizacao do HTML
- **React Query** para fetch e cache dos dados
- **React Router** para navegacao entre topicos

