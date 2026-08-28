import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  // Role is always 'student' for security - admins must be elevated by existing admins
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Only same-origin relative paths are accepted as a post-login destination.
  const rawNext = searchParams.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;

  useEffect(() => {
    if (user) {
      navigate(nextPath ?? '/dashboard');
    }
  }, [user, navigate, nextPath]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password, nextPath ?? undefined);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signUp(email, password, displayName, nextPath ?? undefined);
      if (error) {
        setError(error.message);
      } else {
        setError('');
        // Show success message
        setError(t('auth.signUpSuccess'));
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red-light via-background to-brand-blue-light p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-brand-red" />
            <h1 className="text-2xl font-bold text-brand-red">EduCMS</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.welcome')}</CardTitle>
            <CardDescription>
              {t('auth.welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.tab.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.tab.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="brand-red" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signIn')}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                      setForgotSuccess(false);
                      setForgotEmail(email);
                    }}
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.displayName')}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t('auth.displayNamePlaceholder')}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('auth.createPasswordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('auth.signUpNotice')}
                  </p>
                  <Button type="submit" variant="brand-blue" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {showForgotPassword && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); setError(''); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <p className="text-sm font-medium">{t('auth.reset.title')}</p>
                </div>
                {forgotSuccess ? (
                  <p className="text-sm text-green-600">
                    {t('auth.reset.sent')}
                  </p>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      setError('');
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                          redirectTo: `${window.location.origin}/reset-password`,
                        });
                        if (error) {
                          setError(error.message);
                        } else {
                          setForgotSuccess(true);
                        }
                      } catch {
                        setError(t('auth.unexpectedError'));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">{t('auth.email')}</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" variant="brand-red" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.reset.send')}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {import.meta.env.DEV && (
              <div className="mt-6 p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{t('auth.demo.title')}</p>
                <p className="mt-1">{t('auth.demo.line1')}</p>
                <p className="text-xs mt-2">{t('auth.demo.line2')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
