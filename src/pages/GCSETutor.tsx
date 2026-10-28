import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, BookmarkCheck, Brain, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SUBJECTS_TOPICS } from "@/components/gcse/StudyMaterialForm";

interface PracticeQuestion {
  question: string;
  difficulty: "foundation" | "higher";
  answer: string;
}

interface Lesson {
  title: string;
  explanation: string;
  keyPoints: string[];
  questions: PracticeQuestion[];
}

const ANY_SUBJECT = "any";

interface SavedLesson {
  id: string;
  subject: string | null;
  prompt: string;
  lesson: Lesson;
  created_at: string;
}

export default function GCSETutor() {
  const { language } = useLanguage();
  const pt = language === "pt";
  const [subject, setSubject] = useState(ANY_SUBJECT);
  const [prompt, setPrompt] = useState("");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<SavedLesson[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSaved = useCallback(async () => {
    const { data } = await supabase
      .from("saved_tutor_lessons")
      .select("id, subject, prompt, lesson, created_at")
      .order("created_at", { ascending: false });
    setSaved((data ?? []) as unknown as SavedLesson[]);
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const saveLesson = async () => {
    if (!lesson) return;
    setSaving(true);
    const { data, error: saveError } = await supabase
      .from("saved_tutor_lessons")
      .insert({ prompt, subject: subject === ANY_SUBJECT ? null : subject, lesson: lesson as never })
      .select("id")
      .single();
    setSaving(false);
    if (saveError) {
      toast.error(pt ? "Não foi possível salvar." : "Could not save the lesson.");
      return;
    }
    setSavedId(data.id);
    toast.success(pt ? "Lição salva." : "Lesson saved.");
    loadSaved();
  };

  const openSaved = (s: SavedLesson) => {
    setLesson(s.lesson);
    setPrompt(s.prompt);
    setSubject(s.subject ?? ANY_SUBJECT);
    setSavedId(s.id);
    setRevealed({});
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSaved = async (id: string) => {
    const { error: delError } = await supabase.from("saved_tutor_lessons").delete().eq("id", id);
    if (delError) {
      toast.error(pt ? "Não foi possível excluir." : "Could not delete.");
      return;
    }
    if (savedId === id) setSavedId(null);
    setSaved((list) => list.filter((s) => s.id !== id));
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setRevealed({});
    setSavedId(null);
    const { data, error: fnError } = await supabase.functions.invoke("gcse-tutor", {
      body: { prompt, subject: subject === ANY_SUBJECT ? "" : subject, language },
    });
    setLoading(false);
    if (fnError || !data?.lesson) {
      let message = data?.error as string | undefined;
      const ctx = (fnError as { context?: Response } | null)?.context;
      if (!message && ctx?.json) {
        try { message = (await ctx.json())?.error; } catch { /* ignore */ }
      }
      setError(message ?? (pt ? "Não foi possível gerar a explicação." : "Could not generate the explanation."));
      return;
    }
    setLesson(data.lesson as Lesson);
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{pt ? "Tutor GCSE com IA" : "AI GCSE Tutor"}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {pt
            ? "Escreva um tópico ou pergunta e receba uma explicação e questões de prática."
            : "Enter a topic or question to get a tailored explanation and practice questions."}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_SUBJECT}>{pt ? "Qualquer matéria" : "Any subject"}</SelectItem>
              {Object.keys(SUBJECTS_TOPICS).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={prompt}
            maxLength={1000}
            rows={3}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={pt ? "Ex.: Como resolver equações quadráticas?" : "e.g. How do I solve quadratic equations?"}
          />
          <Button onClick={generate} disabled={loading || !prompt.trim()}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? (pt ? "Gerando..." : "Generating...") : (pt ? "Gerar explicação" : "Generate explanation")}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {lesson && !loading && (
        <>
          <Card>
            <CardHeader><CardTitle>{lesson.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line leading-relaxed">{lesson.explanation}</p>
              <div>
                <h3 className="font-semibold mb-2">{pt ? "Pontos-chave" : "Key points"}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {lesson.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{pt ? "Questões de prática" : "Practice questions"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {lesson.questions.map((q, i) => (
                <div key={i} className="rounded-md border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium whitespace-pre-line">{i + 1}. {q.question}</p>
                    <Badge variant="outline">{q.difficulty === "higher" ? "Higher" : "Foundation"}</Badge>
                  </div>
                  {revealed[i] ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{q.answer}</p>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}>
                      {pt ? "Mostrar resposta" : "Show answer"}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
