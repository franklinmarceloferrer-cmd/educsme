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
import DOMPurify from "dompurify";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudyMaterialImport } from "./StudyMaterialImport";

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
  const { t } = useLanguage();
  const [editorRevision, setEditorRevision] = useState(0);
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
      toast({ title: t("gcse.form.required"), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Authentication required");
      const safeContent = DOMPurify.sanitize(content);

      if (material) {
        const { error } = await supabase
          .from("study_materials")
          .update({ subject, topic, title: title.trim(), content: safeContent, order_index: orderIndex })
          .eq("id", material.id);
        if (error) throw error;
        toast({ title: t("gcse.form.updated") });
      } else {
        const { error } = await supabase
          .from("study_materials")
          .insert({
            subject,
            topic,
            title: title.trim(),
            content: safeContent,
            order_index: orderIndex,
            created_by: auth.user.id,
          });
        if (error) throw error;
        toast({ title: t("gcse.form.created") });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: t("gcse.form.error"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(material ? "gcse.form.edit" : "gcse.form.new")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {open && <StudyMaterialImport key={material?.id || "new"} disabled={loading} hasContent={Boolean(content.trim())} onApply={(importTitle, html) => {
            if (!title.trim()) setTitle(importTitle);
            setContent(html);
            setEditorRevision((revision) => revision + 1);
          }} />}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("gcse.form.subject")} *</Label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setTopic(""); }}>
                <SelectTrigger><SelectValue placeholder={t("gcse.form.selectSubject")} /></SelectTrigger>
                <SelectContent>
                  {Object.keys(SUBJECTS_TOPICS).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("gcse.form.topic")} *</Label>
              <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                <SelectTrigger><SelectValue placeholder={t("gcse.form.selectTopic")} /></SelectTrigger>
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
              <Label>{t("gcse.form.title")} *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("gcse.form.titlePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("gcse.form.order")}</Label>
              <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} min={0} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("gcse.form.content")}</Label>
            <RichTextEditor key={`${material?.id || "new"}-${editorRevision}`} content={content} onChange={setContent} placeholder={t("gcse.form.contentPlaceholder")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("gcse.form.cancel")}</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t(material ? "gcse.form.save" : "gcse.form.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { SUBJECTS_TOPICS };
