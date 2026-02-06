import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Mail, Phone, MapPin, GraduationCap, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentAvatarUpload } from "@/components/students/StudentAvatarUpload";
import { StudentProfileEditDialog } from "@/components/students/StudentProfileEditDialog";
import { ProfileInfoCard } from "@/components/students/ProfileInfoCard";
import { studentsApi, type Student } from "@/lib/supabaseApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isStaff = hasRole('admin') || hasRole('teacher');
  const isViewingOwnProfile = !id; // If no ID, viewing own profile

  // Fetch student data
  const { data: student, isLoading, error } = useQuery({
    queryKey: ['student-profile', id || user?.email],
    queryFn: async () => {
      if (id) {
        // Staff viewing specific student
        return studentsApi.getById(id);
      } else if (user?.email) {
        // Student viewing own profile
        return studentsApi.getByEmail(user.email);
      }
      return null;
    },
    enabled: !!(id || user?.email),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      if (!student) throw new Error("No student data");
      return studentsApi.update(student.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditDialogOpen(false);
      toast.success("Perfil atualizado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil: " + (error as Error).message);
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'graduated':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'graduated':
        return 'Formado';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {isViewingOwnProfile 
                ? "Nenhum registro de estudante encontrado para sua conta."
                : "Estudante não encontrado."}
            </p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header with back button for staff */}
      {isStaff && id && (
        <Button variant="ghost" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Estudantes
        </Button>
      )}

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <StudentAvatarUpload
              student={student}
              size="lg"
              editable={isStaff || isViewingOwnProfile}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>{student.student_id}</span>
                    <span className="mx-1">•</span>
                    <span>{student.grade}</span>
                    <span className="mx-1">•</span>
                    <span>Turma {student.section}</span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(student.status)}>
                  {getStatusLabel(student.status)}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileInfoCard
              icon={Mail}
              label="Email"
              value={student.email}
            />
            <ProfileInfoCard
              icon={Phone}
              label="Telefone"
              value={student.phone || "Não informado"}
              isEmpty={!student.phone}
            />
            <ProfileInfoCard
              icon={MapPin}
              label="Endereço"
              value={student.address || "Não informado"}
              isEmpty={!student.address}
            />
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Acadêmicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileInfoCard
              icon={Hash}
              label="ID do Estudante"
              value={student.student_id}
            />
            <ProfileInfoCard
              icon={GraduationCap}
              label="Série e Turma"
              value={`${student.grade} - Turma ${student.section}`}
            />
            <ProfileInfoCard
              icon={Calendar}
              label="Data de Matrícula"
              value={new Date(student.enrollment_date).toLocaleDateString('pt-BR')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <StudentProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        student={student}
        onSubmit={(data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
        isStaff={isStaff}
      />
    </div>
  );
}
