import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Search, Filter, Download, FileText, Image, Archive, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentsApi, type Document as DocumentType } from "@/lib/supabaseApi";
import { fileStorage } from "@/lib/fileStorage";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Documents() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      // First get the document to find the file path
      const document = documents?.find(d => d.id === documentId);
      if (document) {
        // Extract file path from URL for deletion from storage
        const urlParts = document.file_url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Delete from storage (if it's a storage URL)
        if (document.file_url.includes('supabase')) {
          await fileStorage.deleteFile('documents', fileName);
        }
      }

      // Delete from database
      await documentsApi.delete(documentId);
    },
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    },
  });

  const filteredDocuments = documents?.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <Archive className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      administrative: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      policy: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const handleDownload = async (document: DocumentType) => {
    try {
      if (document.file_url.startsWith('http')) {
        // External URL - open in new tab
        window.open(document.file_url, '_blank');
      } else {
        // Supabase storage file - get signed URL
        const signedUrl = await fileStorage.getSignedUrl('documents', document.file_url);
        if (signedUrl) {
          window.open(signedUrl, '_blank');
        } else {
          toast.error('Failed to generate download link');
        }
      }
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteMutation.mutate(documentId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = hasRole('admin') || hasRole('teacher');

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Access and manage educational resources and files
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : filteredDocuments.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No documents found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "No documents have been uploaded yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(document.file_type)}
                    <CardTitle className="text-base truncate">{document.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document as DocumentType)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canUpload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        title="Delete"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(document.category)}>
                      {document.category}
                    </Badge>
                    <span className="text-xs">{formatFileSize(document.file_size || 0)}</span>
                    {!document.is_public && (
                      <Badge variant="outline" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                  {document.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Uploaded by {document.uploaded_by}</p>
                  <p>{new Date(document.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}