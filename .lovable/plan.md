

# Esqueci a Senha - Password Reset Flow

## O que sera criado

Duas partes:
1. **Link "Esqueci a senha"** na tela de login que abre um formulario para enviar email de recuperacao
2. **Pagina `/reset-password`** onde o usuario define a nova senha apos clicar no link do email

## Arquivos

### Novo: `src/pages/ResetPassword.tsx`
- Pagina publica (sem auth) na rota `/reset-password`
- Detecta `type=recovery` no hash da URL
- Formulario com campo de nova senha + confirmacao
- Chama `supabase.auth.updateUser({ password })` para atualizar
- Redireciona para `/login` apos sucesso

### Modificado: `src/pages/Login.tsx`
- Adicionar link "Esqueci minha senha?" abaixo do botao de Sign In
- Ao clicar, mostra um formulario inline (ou dialog) pedindo o email
- Chama `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- Mostra mensagem de confirmacao ("Verifique seu email")

### Modificado: `src/App.tsx`
- Adicionar rota `<Route path="/reset-password" element={<ResetPassword />} />`

## Detalhes tecnicos
- Usa `supabase.auth.resetPasswordForEmail()` com `redirectTo` apontando para `/reset-password`
- Pagina de reset verifica hash params para evento `PASSWORD_RECOVERY`
- Validacao: senha minima 6 caracteres, confirmacao deve bater
- Nenhuma mudanca no banco de dados necessaria

