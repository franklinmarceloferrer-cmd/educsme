import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardApi, Announcement, Document } from "@/lib/supabaseApi";
import { Megaphone, FileText, AlertTriangle, ArrowRight, Calendar, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GSEExamCard } from "./GSEExamCard";

function UrgentAnnouncementsBanner({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-destructive">Anúncios Urgentes</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="border-destructive/30 bg-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{announcement.title}</CardTitle>
              <CardDescription className="text-xs">
                {format(new Date(announcement.created_at), "d 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {announcement.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnnouncementPreviewCard({ announcement }: { announcement: Announcement }) {
  const categoryColors: Record<string, string> = {
    general: "bg-muted text-muted-foreground",
    urgent: "bg-destructive text-destructive-foreground",
    academic: "bg-primary text-primary-foreground",
    event: "bg-accent text-accent-foreground",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Megaphone className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{announcement.title}</h4>
          <Badge variant="secondary" className={`text-xs ${categoryColors[announcement.category] || ''}`}>
            {announcement.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {announcement.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(new Date(announcement.created_at), "d MMM yyyy", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

function DocumentQuickAccessCard({ document }: { document: Document }) {
  const fileTypeIcons: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "📽️",
    pptx: "📽️",
    default: "📎",
  };

  const getFileIcon = (fileType: string) => {
    const ext = fileType.split('/').pop()?.toLowerCase() || '';
    return fileTypeIcons[ext] || fileTypeIcons.default;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <span className="text-2xl">{getFileIcon(document.file_type)}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{document.name}</h4>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(document.file_size)} • {format(new Date(document.created_at), "d MMM", { locale: ptBR })}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
        <a href={document.file_url} target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

export function StudentDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: dashboardApi.getStudentDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const urgentAnnouncements = data?.urgentAnnouncements || [];
  const recentAnnouncements = data?.recentAnnouncements || [];
  const recentDocuments = data?.recentDocuments || [];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-red">
          Olá, {user?.name}! 👋
        </h1>
        <p className="text-brand-blue">
          Confira as últimas novidades da escola.
        </p>
      </div>

      {/* Urgent Announcements Banner */}
      <UrgentAnnouncementsBanner announcements={urgentAnnouncements} />

      {/* GSE Exam Card */}
      <GSEExamCard />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-brand-red" />
                Últimos Anúncios
              </CardTitle>
              <CardDescription>Novidades recentes da escola</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/announcements" className="flex items-center gap-1">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum anúncio recente
              </p>
            ) : (
              recentAnnouncements.map((announcement) => (
                <AnnouncementPreviewCard key={announcement.id} announcement={announcement} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-blue" />
                Documentos Recentes
              </CardTitle>
              <CardDescription>Arquivos disponíveis para download</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/documents" className="flex items-center gap-1">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum documento recente
              </p>
            ) : (
              recentDocuments.map((document) => (
                <DocumentQuickAccessCard key={document.id} document={document} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
