import type { LocaleModule } from "../types";

/** Login, reset password, invite acceptance and OAuth consent strings. */
export const auth: LocaleModule = {
  en: {
    "auth.welcome": "Welcome",
    "auth.welcomeDescription": "Sign in to your account or create a new one",
    "auth.tab.signIn": "Sign In",
    "auth.tab.signUp": "Sign Up",
    "auth.email": "Email",
    "auth.emailPlaceholder": "Enter your email",
    "auth.password": "Password",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.createPasswordPlaceholder": "Create a password",
    "auth.displayName": "Display Name",
    "auth.displayNamePlaceholder": "Enter your full name",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.forgotPassword": "Forgot your password?",
    "auth.signUpNotice":
      "New accounts are created as students. Contact an administrator for role changes.",
    "auth.signUpSuccess":
      "Account created successfully! Please check your email to verify your account.",
    "auth.unexpectedError": "An unexpected error occurred",
    "auth.reset.title": "Reset your password",
    "auth.reset.sent":
      "Recovery email sent! Check your inbox for a link to reset your password.",
    "auth.reset.send": "Send Reset Link",
    "auth.demo.title": "📚 Portfolio Demo",
    "auth.demo.line1": "This system includes seed data for demonstration purposes.",
    "auth.demo.line2":
      "New accounts start as students. Admins can elevate roles via the admin panel.",

    "auth.newPassword.title": "Reset Password",
    "auth.newPassword.description": "Enter your new password below",
    "auth.newPassword.label": "New Password",
    "auth.newPassword.placeholder": "Enter new password",
    "auth.newPassword.confirmLabel": "Confirm Password",
    "auth.newPassword.confirmPlaceholder": "Confirm new password",
    "auth.newPassword.submit": "Update Password",
    "auth.newPassword.tooShort": "Password must be at least 6 characters.",
    "auth.newPassword.mismatch": "Passwords do not match.",
    "auth.newPassword.success": "Password updated successfully! Redirecting to login...",
    "auth.newPassword.invalidLink":
      "Invalid or expired recovery link. Please request a new password reset.",
    "auth.newPassword.backToLogin": "Back to Login",

    "auth.consent.failed": "Authorization request failed",
    "auth.consent.connect": "Connect {{client}}",
    "auth.consent.description":
      "This lets {{client}} read and manage EduCMS data as you. You can revoke access at any time.",
    "auth.consent.loading": "Loading authorization request…",
    "auth.consent.approve": "Approve",
    "auth.consent.deny": "Deny",
    "auth.consent.anApp": "an app",
    "auth.consent.missingId": "Missing authorization_id",
    "auth.consent.noRedirect": "No redirect returned by the authorization server.",
  },
  pt: {
    "auth.welcome": "Bem-vindo",
    "auth.welcomeDescription": "Inicie sessão na sua conta ou crie uma nova",
    "auth.tab.signIn": "Entrar",
    "auth.tab.signUp": "Criar conta",
    "auth.email": "Email",
    "auth.emailPlaceholder": "Introduza o seu email",
    "auth.password": "Palavra-passe",
    "auth.passwordPlaceholder": "Introduza a sua palavra-passe",
    "auth.createPasswordPlaceholder": "Crie uma palavra-passe",
    "auth.displayName": "Nome a apresentar",
    "auth.displayNamePlaceholder": "Introduza o seu nome completo",
    "auth.signIn": "Entrar",
    "auth.signUp": "Criar conta",
    "auth.forgotPassword": "Esqueceu-se da palavra-passe?",
    "auth.signUpNotice":
      "As novas contas são criadas como alunos. Contacte um administrador para alterar o perfil.",
    "auth.signUpSuccess":
      "Conta criada com sucesso! Verifique o seu email para confirmar a conta.",
    "auth.unexpectedError": "Ocorreu um erro inesperado",
    "auth.reset.title": "Recuperar a palavra-passe",
    "auth.reset.sent":
      "Email de recuperação enviado! Verifique a sua caixa de entrada para redefinir a palavra-passe.",
    "auth.reset.send": "Enviar link de recuperação",
    "auth.demo.title": "📚 Demonstração de portefólio",
    "auth.demo.line1": "Este sistema inclui dados de exemplo para demonstração.",
    "auth.demo.line2":
      "As novas contas começam como alunos. Os administradores podem alterar perfis no painel de administração.",

    "auth.newPassword.title": "Redefinir palavra-passe",
    "auth.newPassword.description": "Introduza abaixo a nova palavra-passe",
    "auth.newPassword.label": "Nova palavra-passe",
    "auth.newPassword.placeholder": "Introduza a nova palavra-passe",
    "auth.newPassword.confirmLabel": "Confirmar palavra-passe",
    "auth.newPassword.confirmPlaceholder": "Confirme a nova palavra-passe",
    "auth.newPassword.submit": "Atualizar palavra-passe",
    "auth.newPassword.tooShort": "A palavra-passe deve ter pelo menos 6 caracteres.",
    "auth.newPassword.mismatch": "As palavras-passe não coincidem.",
    "auth.newPassword.success":
      "Palavra-passe atualizada com sucesso! A redirecionar para o início de sessão...",
    "auth.newPassword.invalidLink":
      "Link de recuperação inválido ou expirado. Solicite uma nova recuperação.",
    "auth.newPassword.backToLogin": "Voltar ao início de sessão",

    "auth.consent.failed": "O pedido de autorização falhou",
    "auth.consent.connect": "Ligar {{client}}",
    "auth.consent.description":
      "Isto permite que {{client}} leia e faça a gestão dos dados do EduCMS em seu nome. Pode revogar o acesso a qualquer momento.",
    "auth.consent.loading": "A carregar o pedido de autorização…",
    "auth.consent.approve": "Aprovar",
    "auth.consent.deny": "Recusar",
    "auth.consent.anApp": "uma aplicação",
    "auth.consent.missingId": "Falta o authorization_id",
    "auth.consent.noRedirect": "O servidor de autorização não devolveu um redirecionamento.",
  },
};
