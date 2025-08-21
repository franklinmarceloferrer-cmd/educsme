import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

export function StorageSetupInstructions() {
  const requiredBuckets = [
    {
      name: 'avatars',
      description: 'Student and user profile pictures',
      isPublic: true,
      maxSize: '5MB',
      fileTypes: 'JPG, PNG, WebP, GIF'
    },
    {
      name: 'documents',
      description: 'Document library files',
      isPublic: false,
      maxSize: '50MB',
      fileTypes: 'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT'
    },
    {
      name: 'announcements',
      description: 'Announcement attachments',
      isPublic: false,
      maxSize: '25MB',
      fileTypes: 'Images, Documents, Archives'
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Manual Setup Required</AlertTitle>
        <AlertDescription>
          Storage buckets must be created manually in the Supabase dashboard to avoid RLS policy violations.
          The application cannot create buckets programmatically.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Required Storage Buckets</CardTitle>
          <CardDescription>
            Create these buckets in your Supabase dashboard for full functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredBuckets.map((bucket, index) => (
            <div key={bucket.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-lg">{bucket.name}</h4>
                <Badge variant={bucket.isPublic ? "secondary" : "outline"}>
                  {bucket.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{bucket.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Max Size:</span> {bucket.maxSize}
                </div>
                <div>
                  <span className="font-medium">File Types:</span> {bucket.fileTypes}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Steps</CardTitle>
          <CardDescription>
            Follow these steps to create the required storage buckets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Open Supabase Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Navigate to your project's Storage section
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open('https://supabase.com/dashboard/project/rttarliasydfffldayui/storage/buckets', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open Storage Dashboard
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Create Each Bucket</p>
                <p className="text-sm text-muted-foreground">
                  Click "New bucket" and create each of the three required buckets with the correct settings
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Configure Permissions</p>
                <p className="text-sm text-muted-foreground">
                  Set up Row Level Security (RLS) policies for proper access control
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open('/docs/supabase-storage-setup.md', '_blank')}
                >
                  View Setup Guide
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Test Configuration</p>
                <p className="text-sm text-muted-foreground">
                  Refresh this page to verify all buckets are properly configured
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>After Setup</AlertTitle>
        <AlertDescription>
          Once all buckets are created, file upload features will work correctly throughout the application.
          You can test uploads by trying to add a student avatar or upload a document.
        </AlertDescription>
      </Alert>
    </div>
  );
}
