import { useState } from "react";
import DOMPurify from "dompurify";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ImportedMaterial {
  title: string;
  html: string;
  sourceUrl: string;
  fetchedAt: string;
  creditsUsed: number | null;
}

export function StudyMaterialImport({ hasContent, disabled, onApply }: {
  hasContent: boolean;
  disabled: boolean;
  onApply: (title: string, html: string) => void;
}) {
  const { t, language } = useLanguage();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportedMaterial | null>(null);
  const [confirm, setConfirm] = useState(false);

  const fetchPage = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("import-study-material", { body: { url } });
      if (invokeError) {
        const details = invokeError instanceof FunctionsHttpError ? await invokeError.context.text() : invokeError.message;
        throw new Error(details);
      }
      const html = DOMPurify.sanitize(data.html, {
        ALLOWED_TAGS: ["p", "br", "h1", "h2", "h3", "ul", "ol", "li", "strong", "em", "blockquote", "code", "pre"],
        ALLOWED_ATTR: [],
      });
      if (!new DOMParser().parseFromString(html, "text/html").body.textContent?.trim()) throw new Error(t("gcse.import.empty"));
      setResult({ ...data, html });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("gcse.import.failed"));
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!result) return;
    const citation = document.createElement("p");
    citation.textContent = `${t("gcse.import.source")}: ${result.sourceUrl} — ${t("gcse.import.date")}: ${new Date(result.fetchedAt).toLocaleDateString(language === "pt" ? "pt-PT" : "en-GB")}`;
    onApply(result.title, `${result.html}${citation.outerHTML}`);
    setResult(null);
    setConfirm(false);
  };

  return (
    <section className="space-y-3 border-b pb-4">
      <Label htmlFor="study-source-url">{t("gcse.import.url")}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input id="study-source-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" disabled={disabled || loading} />
        <Button type="button" variant="outline" disabled={disabled || loading || !url.trim()} onClick={fetchPage}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {t(loading ? "gcse.import.fetching" : "gcse.import.fetch")}
        </Button>
      </div>
      {error && <p role="alert" className="break-words text-sm text-destructive">{t("gcse.import.failed")}: {error}</p>}
      {result && (
        <div className="space-y-3">
          <h3 className="font-medium">{t("gcse.import.review")}</h3>
          <p className="break-words text-sm text-muted-foreground">{result.title}</p>
          <div className="prose prose-sm max-h-64 max-w-none overflow-y-auto break-words dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.html }} />
          <p className="break-all text-xs text-muted-foreground">{t("gcse.import.source")}: {result.sourceUrl}</p>
          {typeof result.creditsUsed === "number" && <p className="text-xs text-muted-foreground">{t("gcse.import.usage", { standard: result.creditsUsed * 0.004, business: result.creditsUsed * 0.002 })}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={disabled} onClick={() => hasContent ? setConfirm(true) : apply()}>{t("gcse.import.apply")}</Button>
            <Button type="button" variant="ghost" onClick={() => setResult(null)}>{t("gcse.import.discard")}</Button>
          </div>
        </div>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("gcse.import.replace")}</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("gcse.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={apply}>{t("gcse.import.apply")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}