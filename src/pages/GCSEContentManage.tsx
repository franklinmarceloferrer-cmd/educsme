import { BookOpen } from "lucide-react";
import { StudyMaterialList } from "@/components/gcse/StudyMaterialList";

export default function GCSEContentManage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-brand-red" />
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Conteúdos GCSE</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Crie e edite materiais de estudo para os estudantes acessarem na grade GCSE.
        </p>
      </div>
      <StudyMaterialList />
    </div>
  );
}
