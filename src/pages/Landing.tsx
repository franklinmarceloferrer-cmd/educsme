import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  GraduationCap,
  Megaphone,
  FileText,
  Users,
  BarChart3,
  Shield,
  UserCog,
  Check,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: Megaphone, key: "announcements" },
  { icon: FileText, key: "documents" },
  { icon: Users, key: "students" },
  { icon: BarChart3, key: "reports" },
  { icon: UserCog, key: "roles" },
  { icon: Shield, key: "security" },
] as const;

const BENEFIT_KEYS = [
  "landing.benefits.item1",
  "landing.benefits.item2",
  "landing.benefits.item3",
  "landing.benefits.item4",
  "landing.benefits.item5",
  "landing.benefits.item6",
] as const;

export default function Landing() {
  const { t } = useTranslation();

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
              {t("landing.nav.features")}
            </a>
            <a href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.nav.benefits")}
            </a>
            <LanguageSwitcher />
            <Button asChild variant="brand-red">
              <Link to="/login">{t("landing.nav.signIn")}</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <Button asChild variant="brand-red">
              <Link to="/login">{t("landing.nav.signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red-light via-background to-brand-blue-light opacity-50" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t("landing.hero.title")}{" "}
              <span className="text-brand-red">{t("landing.hero.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              {t("landing.hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="brand-red">
                <Link to="/login">
                  {t("landing.hero.primaryCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="brand-blue-outline">
                <a href="#recursos">{t("landing.hero.secondaryCta")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.features.subtitle")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.key} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-red-light group-hover:bg-brand-red/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-brand-red" />
                </div>
                <CardTitle className="text-xl">
                  {t(`landing.features.${feature.key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t(`landing.features.${feature.key}.description`)}
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
              {t("landing.benefits.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("landing.benefits.subtitle")}
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <ul className="grid gap-4">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-4 rounded-lg bg-background p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light">
                    <Check className="h-4 w-4 text-brand-blue" />
                  </div>
                  <span className="font-medium">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="rounded-2xl bg-gradient-to-r from-brand-red to-brand-blue p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.cta.title")}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            {t("landing.cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">{t("landing.cta.signUp")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/login">{t("landing.cta.signIn")}</Link>
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
              {t("landing.footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("landing.footer.builtWith")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
