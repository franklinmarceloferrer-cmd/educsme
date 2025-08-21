import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Search, Filter, Download, FileText, Image, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentsApi } from "@/lib/mockApi";
import { useAuth } from "@/contexts/AuthContext";

export default function Documents() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.getAll,
  });

  const filteredDocuments = documents?.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <Archive className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      syllabus: "bg-blue-100 text-blue-800",
      assignment: "bg-green-100 text-green-800",
      resource: "bg-purple-100 text-purple-800",
      form: "bg-orange-100 text-orange-800",
    };
    return colors[category as keyof typeof colors] || colors.resource;
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
          <Button>
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
                  <div className="flex items-center gap-2">
                    {getFileIcon(document.type)}
                    <CardTitle className="text-base truncate">{document.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(document.category)}>
                      {document.category}
                    </Badge>
                    <span className="text-xs">{formatFileSize(document.size)}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Uploaded by {document.uploadedBy}</p>
                  <p>{new Date(document.uploadedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}