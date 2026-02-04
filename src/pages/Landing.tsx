import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Megaphone, 
  FileText, 
  Users, 
  BarChart3, 
  Shield, 
  UserCog,
  Check,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Megaphone,
    title: "Anúncios",
    description: "Comunique-se de forma eficiente com toda a comunidade escolar através de anúncios categorizados e prioritários."
  },
  {
    icon: FileText,
    title: "Documentos",
    description: "Gerencie e compartilhe documentos importantes de forma organizada e segura com controle de acesso."
  },
  {
    icon: Users,
    title: "Estudantes",
    description: "Cadastro completo de estudantes com informações de matrícula, turma e histórico acadêmico."
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description: "Visualize métricas e estatísticas importantes através de dashboards intuitivos e exportáveis."
  },
  {
    icon: UserCog,
    title: "Multi-roles",
    description: "Sistema de permissões com diferentes níveis de acesso: administrador, professor e estudante."
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Autenticação segura e políticas de acesso granulares para proteger dados sensíveis."
  }
];

const benefits = [
  "Interface intuitiva e moderna",
  "Acesso personalizado por perfil",
  "Dashboard com visão geral em tempo real",
  "Comunicação centralizada e organizada",
  "Gestão simplificada de documentos",
  "Relatórios detalhados e exportáveis"
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-brand-red" />
            <span className="text-xl font-bold text-brand-red">EduCMS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#recursos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </a>
            <Button asChild variant="brand-red">
              <Link to="/login">Entrar</Link>
            </Button>
          </nav>
          <Button asChild variant="brand-red" className="md:hidden">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red-light via-background to-brand-blue-light opacity-50" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gestão Educacional{" "}
              <span className="text-brand-red">Simplificada</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Plataforma completa para gerenciar anúncios, documentos e estudantes. 
              Tudo o que sua instituição precisa em um único lugar.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="brand-red">
                <Link to="/login">
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="brand-blue-outline">
                <a href="#recursos">Saiba Mais</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Recursos Principais
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ferramentas poderosas para uma gestão educacional eficiente
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-red-light group-hover:bg-brand-red/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-brand-red" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="bg-muted/50 py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Por que escolher o EduCMS?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Uma plataforma pensada para facilitar o dia a dia de instituições educacionais
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <ul className="grid gap-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-4 rounded-lg bg-background p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light">
                    <Check className="h-4 w-4 text-brand-blue" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="rounded-2xl bg-gradient-to-r from-brand-red to-brand-blue p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Crie sua conta gratuitamente e transforme a gestão da sua instituição
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-brand-red hover:bg-white/90">
              <Link to="/login">Criar Conta</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/login">Fazer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-red" />
              <span className="font-semibold text-brand-red">EduCMS</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} EduCMS. Projeto de Portfolio.
            </p>
            <p className="text-xs text-muted-foreground">
              Desenvolvido com React, TypeScript e Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
