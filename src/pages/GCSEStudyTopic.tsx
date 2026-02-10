import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { SUBJECTS_TOPICS } from "@/components/gcse/StudyMaterialForm";

export default function GCSEStudyTopic() {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();
  const decodedSubject = decodeURIComponent(subject || "");
  const decodedTopic = decodeURIComponent(topic || "");

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["study-materials", decodedSubject, decodedTopic],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .eq("subject", decodedSubject)
        .eq("topic", decodedTopic)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!decodedSubject && !!decodedTopic,
  });

  const siblingTopics = SUBJECTS_TOPICS[decodedSubject] || [];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/gse-resources"><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Link>
        </Button>
      </div>

      <div>
        <Badge variant="outline" className="mb-2">{decodedSubject}</Badge>
        <h1 className="text-2xl font-bold tracking-tight">{decodedTopic}</h1>
      </div>

      {/* Sidebar-style topic navigation */}
      {siblingTopics.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {siblingTopics.map((t) => (
            <Button
              key={t}
              variant={t === decodedTopic ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link to={`/gcse-study/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(t)}`}>
                {t}
              </Link>
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Nenhum conteúdo disponível</p>
            <p className="text-sm">Os professores ainda não adicionaram materiais para este tópico.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{m.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
