import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, BookOpen, Loader2 } from "lucide-react";
import { StudyMaterialForm, SUBJECTS_TOPICS } from "./StudyMaterialForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudyMaterial {
  id: string;
  subject: string;
  topic: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export function StudyMaterialList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["study-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .order("subject")
        .order("topic")
        .order("order_index");
      if (error) throw error;
      return data as StudyMaterial[];
    },
  });

  const filtered = filterSubject === "all" ? materials : materials.filter((m) => m.subject === filterSubject);

  const grouped = filtered.reduce<Record<string, Record<string, StudyMaterial[]>>>((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = {};
    if (!acc[m.subject][m.topic]) acc[m.subject][m.topic] = [];
    acc[m.subject][m.topic].push(m);
    return acc;
  }, {});

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("study_materials").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conteúdo excluído" });
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
    }
    setDeleteId(null);
  };

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditingMaterial(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrar por matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {Object.keys(SUBJECTS_TOPICS).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filtered.length} conteúdo(s)</Badge>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Nenhum conteúdo encontrado</p>
            <p className="text-sm">Clique em "Novo Conteúdo" para começar a criar materiais de estudo.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([subject, topics]) => (
          <Card key={subject}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{subject}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(topics).map(([topic, items]) => (
                <div key={topic} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{topic}</h4>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.order_index}</Badge>
                          <span className="text-sm">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      <StudyMaterialForm
        open={formOpen}
        onOpenChange={setFormOpen}
        material={editingMaterial}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["study-materials"] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conteúdo?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
