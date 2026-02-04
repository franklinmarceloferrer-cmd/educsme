

## Plano: Landing Page para EduCMS

### Visao Geral
Criar uma landing page profissional e atrativa que sera exibida antes da pagina de login. Esta pagina servira como vitrine do EduCMS, apresentando suas funcionalidades e beneficios para instituicoes educacionais.

---

### Estrutura da Landing Page

```text
+--------------------------------------------------+
|  [Logo] EduCMS              [Sobre] [Recursos] [Entrar] |
+--------------------------------------------------+
|                                                  |
|     Gestao Educacional                           |
|     Simplificada                                 |
|                                                  |
|     Plataforma completa para gerenciar           |
|     anuncios, documentos e estudantes            |
|                                                  |
|     [Comecar Agora]  [Saiba Mais]               |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  RECURSOS PRINCIPAIS                             |
|                                                  |
|  [Card 1]        [Card 2]        [Card 3]       |
|  Anuncios        Documentos      Estudantes     |
|                                                  |
|  [Card 4]        [Card 5]        [Card 6]       |
|  Relatorios      Multi-roles     Seguranca      |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  POR QUE ESCOLHER O EDUCMS?                      |
|                                                  |
|  - Interface intuitiva                           |
|  - Acesso por roles (admin, professor, aluno)    |
|  - Dashboard personalizado                       |
|  - Comunicacao centralizada                      |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  PRONTO PARA COMECAR?                            |
|                                                  |
|  [Criar Conta]  [Fazer Login]                   |
|                                                  |
+--------------------------------------------------+
|  Footer: EduCMS 2025 | Portfolio Demo            |
+--------------------------------------------------+
```

---

### 1. Criar Nova Pagina (`src/pages/Landing.tsx`)

**Secoes da pagina:**

1. **Header/Navbar**
   - Logo EduCMS
   - Links de navegacao interna (scroll suave)
   - Botao "Entrar" que redireciona para `/login`

2. **Hero Section**
   - Titulo principal atrativo
   - Subtitulo descritivo
   - Botoes CTA: "Comecar Agora" e "Saiba Mais"
   - Imagem/ilustracao decorativa (usando icones Lucide)

3. **Features Section**
   - Grid com 6 cards de recursos
   - Cada card com icone, titulo e descricao
   - Recursos: Anuncios, Documentos, Estudantes, Relatorios, Multi-roles, Seguranca

4. **Benefits Section**
   - Lista de beneficios com icones de check
   - Destaque visual para cada ponto

5. **CTA Final**
   - Chamada para acao
   - Botoes para criar conta ou fazer login

6. **Footer**
   - Copyright
   - Indicacao de projeto de portfolio

---

### 2. Atualizar Roteamento (`src/App.tsx`)

**Alteracoes:**
- Adicionar rota `/` para a Landing page (publica)
- Mover Dashboard para `/dashboard`
- Atualizar ProtectedRoute para redirecionar para `/dashboard`

```typescript
// Novas rotas:
<Route path="/" element={<Landing />} />
<Route path="/login" element={<Login />} />
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

### 3. Atualizar Redirecionamentos

**Arquivos a modificar:**

- `src/pages/Login.tsx`: Apos login, redirecionar para `/dashboard`
- `src/contexts/AuthContext.tsx`: Verificar se ja redireciona corretamente
- `src/components/layout/AppSidebar.tsx`: Link do Dashboard aponta para `/dashboard`

---

### 4. Design Visual

**Paleta de cores (ja existente):**
- Vermelho principal: `#e4042c` (brand-red)
- Azul secundario: `#207ea4` (brand-blue)
- Fundos claros: brand-red-light, brand-blue-light
- Gradientes sutis

**Elementos visuais:**
- Icones Lucide React para cada feature
- Cards com sombras e hover effects
- Gradiente no hero section
- Animacoes suaves de entrada (opcional)

---

### 5. Componentes Auxiliares

Criar componentes reutilizaveis (opcional, pode ser inline):

- `LandingNavbar` - Barra de navegacao da landing
- `FeatureCard` - Card de recurso individual
- `LandingFooter` - Rodape da landing

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/Landing.tsx` | Criar - Pagina principal da landing |
| `src/App.tsx` | Modificar - Atualizar rotas |
| `src/pages/Login.tsx` | Modificar - Atualizar redirecionamento pos-login |
| `src/components/layout/AppSidebar.tsx` | Modificar - Atualizar link do Dashboard |

---

### Beneficios

- Apresentacao profissional do projeto
- Primeira impressao positiva para recrutadores
- Explica claramente o proposito do sistema
- Navegacao intuitiva para o login
- Demonstra habilidades de design e UX

