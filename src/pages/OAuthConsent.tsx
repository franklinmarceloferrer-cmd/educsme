import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";

type AuthorizationDetails = {
  client?: { name?: string };
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;

    (async () => {
      if (!authorizationId) {
        setError(t("auth.consent.missingId"));
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }

      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }

      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();

    return () => {
      active = false;
    };
  }, [authorizationId, t]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error: decisionError } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);

    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }

    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError(t("auth.consent.noRedirect"));
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? t("auth.consent.anApp");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red-light via-background to-brand-blue-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-6 w-6 text-brand-red" />
            <span className="font-bold text-brand-red">EduCMS</span>
          </div>
          <CardTitle>
            {error ? t("auth.consent.failed") : t("auth.consent.connect", { client: clientName })}
          </CardTitle>
          <CardDescription>
            {error
              ? error
              : details
                ? t("auth.consent.description", { client: clientName })
                : t("auth.consent.loading")}
          </CardDescription>
        </CardHeader>
        {!error && details && (
          <CardContent className="flex gap-2">
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.consent.approve")}
            </Button>
            <Button className="flex-1" variant="outline" disabled={busy} onClick={() => decide(false)}>
              {t("auth.consent.deny")}
            </Button>
          </CardContent>
        )}
        {!error && !details && (
          <CardContent className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
