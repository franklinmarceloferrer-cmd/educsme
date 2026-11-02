import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, BookmarkCheck, Brain, Check, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SUBJECTS_TOPICS } from "@/components/gcse/StudyMaterialForm";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

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

const countMissed = (p: Record<string, string>) => Object.values(p).filter((v) => v === "missed").length;

interface SavedLesson {
  id: string;
  subject: string | null;
  prompt: string;
  lesson: Lesson;
  progress: Progress;
  created_at: string;
}

type QuestionStatus = "correct" | "missed";
type Progress = Record<string, QuestionStatus>;

export default function GCSETutor() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [progress, setProgress] = useState<Progress>({});
  const [onlyMissed, setOnlyMissed] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_tutor_lessons")
      .select("id, subject, prompt, lesson, progress, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSaved((data ?? []) as unknown as SavedLesson[]);
  }, [user?.id]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  useEffect(() => {
    const lessonId = searchParams.get("lesson");
    if (!lessonId || !user) return;
    let cancelled = false;
    const reviewMissed = searchParams.get("review") === "missed";
    const openLinkedLesson = async () => {
      const { data, error: linkedError } = await supabase.from("saved_tutor_lessons")
        .select("id, subject, prompt, lesson, progress, created_at")
        .eq("id", lessonId).eq("user_id", user.id).single();
      if (cancelled) return;
      if (linkedError || !data) {
        setError(pt ? "Não foi possível abrir esta lição salva." : "Could not open this saved lesson.");
        return;
      }
      const linked = data as unknown as SavedLesson;
      setLesson(linked.lesson);
      setPrompt(linked.prompt);
      setSubject(linked.subject ?? ANY_SUBJECT);
      setSavedId(linked.id);
      setProgress(linked.progress ?? {});
      setRevealed({});
      setOnlyMissed(reviewMissed);
      setError(null);
    };
    openLinkedLesson();
    return () => { cancelled = true; };
  }, [searchParams, user?.id, pt]);

  const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: ["tutor-progress", user?.id] });
  const clearLessonLink = () => {
    if (!searchParams.has("lesson")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("lesson");
    next.delete("review");
    setSearchParams(next, { replace: true });
  };

  const saveLesson = async () => {
    if (!lesson) return;
    setSaving(true);
    const { data, error: saveError } = await supabase
      .from("saved_tutor_lessons")
      .insert({ prompt, subject: subject === ANY_SUBJECT ? null : subject, lesson: lesson as never, progress: progress as never })
      .select("id")
      .single();
    setSaving(false);
    if (saveError) {
      toast.error(pt ? "Não foi possível salvar." : "Could not save the lesson.");
      return;
    }
    setSavedId(data.id);
    refreshDashboard();
    toast.success(pt ? "Lição salva." : "Lesson saved.");
    loadSaved();
  };

  const openSaved = (s: SavedLesson) => {
    clearLessonLink();
    setLesson(s.lesson);
    setPrompt(s.prompt);
    setSubject(s.subject ?? ANY_SUBJECT);
    setSavedId(s.id);
    setRevealed({});
    setProgress(s.progress ?? {});
    setOnlyMissed(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markQuestion = async (index: number, status: QuestionStatus) => {
    const next: Progress = { ...progress };
    if (next[index] === status) delete next[index];
    else next[index] = status;
    setProgress(next);
    if (!savedId) return;
    const { error: updError } = await supabase
      .from("saved_tutor_lessons")
      .update({ progress: next as never })
      .eq("id", savedId);
    if (updError) {
      setProgress(progress);
      toast.error(pt ? "Não foi possível salvar o progresso." : "Could not save progress.");
      return;
    }
    setSaved((list) => list.map((s) => (s.id === savedId ? { ...s, progress: next } : s)));
    refreshDashboard();
  };

  const deleteSaved = async (id: string) => {
    const { error: delError } = await supabase.from("saved_tutor_lessons").delete().eq("id", id);
    if (delError) {
      toast.error(pt ? "Não foi possível excluir." : "Could not delete.");
      return;
    }
    if (savedId === id) setSavedId(null);
    setSaved((list) => list.filter((s) => s.id !== id));
    clearLessonLink();
    refreshDashboard();
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    clearLessonLink();
    setLoading(true);
    setError(null);
    setRevealed({});
    setSavedId(null);
    setProgress({});
    setOnlyMissed(false);
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
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle>{lesson.title}</CardTitle>
              <Button variant="outline" size="sm" onClick={saveLesson} disabled={saving || !!savedId}>
                {savedId ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                {savedId ? (pt ? "Salva" : "Saved") : (pt ? "Salvar" : "Save")}
              </Button>
            </CardHeader>
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
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 flex-wrap">
              <div>
                <CardTitle>{pt ? "Questões de prática" : "Practice questions"}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {pt
                    ? `${Object.keys(progress).length} de ${lesson.questions.length} concluídas · ${countMissed(progress)} erradas`
                    : `${Object.keys(progress).length} of ${lesson.questions.length} completed · ${countMissed(progress)} missed`}
                </p>
              </div>
              {countMissed(progress) > 0 && (
                <Button variant={onlyMissed ? "default" : "outline"} size="sm" onClick={() => setOnlyMissed((v) => !v)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {onlyMissed ? (pt ? "Mostrar todas" : "Show all") : (pt ? "Rever erradas" : "Review missed")}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.questions.map((q, i) => (onlyMissed && progress[i] !== "missed") ? null : (
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
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={progress[i] === "correct" ? "default" : "outline"}
                      onClick={() => markQuestion(i, "correct")}
                    >
                      <Check className="h-4 w-4 mr-1" />{pt ? "Acertei" : "Got it"}
                    </Button>
                    <Button
                      size="sm"
                      variant={progress[i] === "missed" ? "destructive" : "outline"}
                      onClick={() => markQuestion(i, "missed")}
                    >
                      <X className="h-4 w-4 mr-1" />{pt ? "Errei" : "Missed"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader><CardTitle>{pt ? "Lições salvas" : "Saved lessons"}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {pt ? "Nenhuma lição salva ainda." : "No saved lessons yet."}
            </p>
          ) : (
            saved.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
                <button className="text-left flex-1 min-w-0" onClick={() => openSaved(s)}>
                  <p className="font-medium truncate">{s.lesson.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.subject ? `${s.subject} · ` : ""}
                    {new Date(s.created_at).toLocaleDateString(pt ? "pt-BR" : "en-GB")}
                    {` · ${Object.keys(s.progress ?? {}).length}/${s.lesson.questions.length} ${pt ? "concluídas" : "done"}`}
                    {countMissed(s.progress ?? {}) > 0 && ` · ${countMissed(s.progress ?? {})} ${pt ? "erradas" : "missed"}`}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={pt ? "Excluir" : "Delete"}
                  onClick={() => deleteSaved(s.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
