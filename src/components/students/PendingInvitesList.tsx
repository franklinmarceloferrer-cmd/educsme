import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, Check, XCircle, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { type StudentInvite } from "@/lib/supabaseApi";
import { toast } from "sonner";

interface PendingInvitesListProps {
  invites: StudentInvite[];
  onRevoke: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function PendingInvitesList({
  invites,
  onRevoke,
  isLoading,
}: PendingInvitesListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<StudentInvite | null>(null);
  const [revoking, setRevoking] = useState(false);

  const copyInviteLink = async (invite: StudentInvite) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invite/${invite.token}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invite.id);
      toast.success("Link copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleRevoke = async () => {
    if (!selectedInvite) return;
    
    setRevoking(true);
    try {
      await onRevoke(selectedInvite.id);
      toast.success("Convite revogado");
    } catch (error) {
      toast.error("Erro ao revogar convite");
    } finally {
      setRevoking(false);
      setRevokeDialogOpen(false);
      setSelectedInvite(null);
    }
  };

  const getStatusBadge = (invite: StudentInvite) => {
    const isExpired = new Date(invite.expires_at) < new Date();
    
    if (invite.status === "accepted") {
      return <Badge variant="default">Aceito</Badge>;
    }
    if (invite.status === "revoked") {
      return <Badge variant="destructive">Revogado</Badge>;
    }
    if (isExpired || invite.status === "expired") {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending" && new Date(invite.expires_at) > new Date()
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 py-4">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pendingInvites.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum convite pendente</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudante</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Série/Turma</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.name}</TableCell>
              <TableCell>{invite.email}</TableCell>
              <TableCell>
                {invite.grade} - {invite.section}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(invite.expires_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>{getStatusBadge(invite)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyInviteLink(invite)}>
                      {copiedId === invite.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-primary" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setSelectedInvite(invite);
                        setRevokeDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Revogar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Convite</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar o convite para{" "}
              <strong>{selectedInvite?.name}</strong>? O link de convite não
              funcionará mais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoking ? "Revogando..." : "Revogar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
