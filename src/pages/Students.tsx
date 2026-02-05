import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Download, Edit, Trash2, Mail, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentAvatarUpload } from "@/components/students/StudentAvatarUpload";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { DeleteStudentDialog } from "@/components/students/DeleteStudentDialog";
import { StudentFilters } from "@/components/students/StudentFilters";
import { EmptyStudentsState } from "@/components/students/EmptyStudentsState";
import { InviteStudentDialog } from "@/components/students/InviteStudentDialog";
import { PendingInvitesList } from "@/components/students/PendingInvitesList";
import { studentsApi, invitesApi, type Student, type StudentInvite } from "@/lib/supabaseApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Students() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Queries
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });

  const { data: invites, isLoading: invitesLoading } = useQuery({
    queryKey: ['student-invites'],
    queryFn: invitesApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setFormDialogOpen(false);
      setSelectedStudent(null);
      toast.success("Student added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add student: " + (error as Error).message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setFormDialogOpen(false);
      setSelectedStudent(null);
      toast.success("Student updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update student: " + (error as Error).message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
      toast.success("Student deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete student: " + (error as Error).message);
    },
  });

  // Filter students
  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !gradeFilter || gradeFilter === "all" || student.grade === gradeFilter;
    const matchesSection = !sectionFilter || sectionFilter === "all" || student.section === sectionFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesGrade && matchesSection && matchesStatus;
  }) || [];

  const hasFilters = !!searchTerm || (!!gradeFilter && gradeFilter !== "all") || 
                     (!!sectionFilter && sectionFilter !== "all") || 
                     (!!statusFilter && statusFilter !== "all");

  const clearFilters = () => {
    setSearchTerm("");
    setGradeFilter("");
    setSectionFilter("");
    setStatusFilter("");
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'avatar_url'>) => {
    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, data });
    } else {
      createMutation.mutate(data as Omit<Student, 'id' | 'created_at' | 'updated_at'>);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedStudent) {
      deleteMutation.mutate(selectedStudent.id);
    }
  };

  const handleCreateInvite = async (data: {
    email: string;
    name: string;
    grade: string;
    section: string;
    student_id?: string;
  }) => {
    const result = await invitesApi.create(data);
    return { token: result.token };
  };

  const handleRevokeInvite = async (id: string) => {
    await invitesApi.revoke(id);
    queryClient.invalidateQueries({ queryKey: ['student-invites'] });
  };

  const exportToCSV = () => {
    if (!students) return;

    const csvContent = [
      ["Student ID", "Name", "Email", "Grade", "Section", "Enrollment Date", "Status"],
      ...students.map(student => [
        student.student_id,
        student.name,
        student.email,
        student.grade,
        student.section,
        student.enrollment_date,
        student.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Student report exported successfully");
  };

  const canManage = hasRole('admin') || hasRole('teacher');
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const pendingInvitesCount = invites?.filter(
    (i) => i.status === 'pending' && new Date(i.expires_at) > new Date()
  ).length || 0;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-red">Students</h1>
          <p className="text-brand-blue">
            Manage student enrollment and information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="brand-blue-outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Convidar
              </Button>
              <Button variant="brand-red" onClick={handleAddStudent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Estudantes
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Convites Pendentes
              {pendingInvitesCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingInvitesCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <StudentFilters
              gradeFilter={gradeFilter}
              sectionFilter={sectionFilter}
              statusFilter={statusFilter}
              onGradeChange={setGradeFilter}
              onSectionChange={setSectionFilter}
              onStatusChange={setStatusFilter}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 py-4">
                      <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <EmptyStudentsState
                  hasFilters={hasFilters}
                  canManage={canManage}
                  onAddStudent={handleAddStudent}
                  onClearFilters={clearFilters}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Status</TableHead>
                      {canManage && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <StudentAvatarUpload
                              student={student}
                              size="sm"
                              editable={canManage}
                            />
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.student_id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>{new Date(student.enrollment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(student)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManage && (
          <TabsContent value="invites">
            <Card>
              <CardHeader>
                <CardTitle>Convites Pendentes</CardTitle>
                <CardDescription>
                  Gerencie os convites enviados para novos estudantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PendingInvitesList
                  invites={invites || []}
                  onRevoke={handleRevokeInvite}
                  isLoading={invitesLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <StudentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        student={selectedStudent}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      <DeleteStudentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        student={selectedStudent}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <InviteStudentDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['student-invites'] })}
        onCreateInvite={handleCreateInvite}
      />
    </div>
  );
}
