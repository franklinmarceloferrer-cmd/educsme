import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const SUBJECTS_TOPICS: Record<string, string[]> = {
  "Mathematics": ["Number & Algebra", "Geometry & Measures", "Statistics & Probability", "Ratio & Proportion"],
  "English Language": ["Reading Comprehension", "Creative Writing", "Transactional Writing", "Spoken Language"],
  "English Literature": ["Shakespeare", "19th Century Novel", "Modern Text / Drama", "Poetry Anthology"],
  "Combined Science": ["Biology – Cell Biology & Organisation", "Chemistry – Atomic Structure & Bonding", "Physics – Energy & Forces", "Required Practicals Review"],
  "History": ["Medicine Through Time", "Elizabethan England", "Weimar & Nazi Germany", "Source Analysis Practice"],
  "Geography": ["Physical Geography (Coasts, Rivers)", "Human Geography (Urban, Development)", "Fieldwork & Skills", "Case Studies Review"],
};

interface StudyMaterial {
  id: string;
  subject: string;
  topic: string;
  title: string;
  content: string;
  order_index: number;
}

interface StudyMaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: StudyMaterial | null;
  onSuccess: () => void;
}

export function StudyMaterialForm({ open, onOpenChange, material, onSuccess }: StudyMaterialFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    if (material) {
      setSubject(material.subject);
      setTopic(material.topic);
      setTitle(material.title);
      setContent(material.content);
      setOrderIndex(material.order_index);
    } else {
      setSubject("");
      setTopic("");
      setTitle("");
      setContent("");
      setOrderIndex(0);
    }
  }, [material, open]);

  const availableTopics = subject ? SUBJECTS_TOPICS[subject] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic || !title.trim()) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .single();

      if (material) {
        const { error } = await supabase
          .from("study_materials")
          .update({ subject, topic, title: title.trim(), content, order_index: orderIndex })
          .eq("id", material.id);
        if (error) throw error;
        toast({ title: "Conteúdo atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("study_materials")
          .insert({
            subject,
            topic,
            title: title.trim(),
            content,
            order_index: orderIndex,
            created_by: profile?.user_id,
          });
        if (error) throw error;
        toast({ title: "Conteúdo criado com sucesso!" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Erro ao salvar conteúdo", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? "Editar Conteúdo" : "Novo Conteúdo de Estudo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Matéria *</Label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setTopic(""); }}>
                <SelectTrigger><SelectValue placeholder="Selecione a matéria" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(SUBJECTS_TOPICS).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tópico *</Label>
              <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                <SelectTrigger><SelectValue placeholder="Selecione o tópico" /></SelectTrigger>
                <SelectContent>
                  {availableTopics.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Introdução à Álgebra" />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} min={0} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Escreva o conteúdo de estudo aqui..." />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {material ? "Salvar Alterações" : "Criar Conteúdo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { SUBJECTS_TOPICS };
