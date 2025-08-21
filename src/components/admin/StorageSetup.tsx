import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { fileStorage, type StorageBucket } from "@/lib/fileStorage";
import { toast } from "sonner";

interface StorageStatus {
  buckets: Record<StorageBucket, { exists: boolean; error?: string }>;
  allReady: boolean;
}

export function StorageSetup() {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkStorageStatus = async () => {
    setChecking(true);
    try {
      const storageStatus = await fileStorage.getStorageStatus();
      setStatus(storageStatus);
      
      if (storageStatus.allReady) {
        toast.success("All storage buckets are configured correctly!");
      } else {
        toast.warning("Some storage buckets need to be configured.");
      }
    } catch (error) {
      console.error("Failed to check storage status:", error);
      toast.error("Failed to check storage status");
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const getBucketStatusIcon = (exists: boolean) => {
    return exists ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getBucketStatusBadge = (exists: boolean) => {
    return exists ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ready
      </Badge>
    ) : (
      <Badge variant="destructive">
        Missing
      </Badge>
    );
  };

  const setupInstructions = fileStorage.getBucketSetupInstructions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Checking Storage Configuration...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Storage Bucket Status</span>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStorageStatus}
              disabled={checking}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Check the status of required Supabase storage buckets for file uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <>
              {!status.allReady && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Storage Configuration Required</AlertTitle>
                  <AlertDescription>
                    Some storage buckets are missing or not accessible. File upload features may not work correctly.
                    Please create the missing buckets in your Supabase dashboard.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {Object.entries(status.buckets).map(([bucket, bucketStatus]) => (
                  <div key={bucket} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getBucketStatusIcon(bucketStatus.exists)}
                      <div>
                        <p className="font-medium">{bucket}</p>
                        {bucketStatus.error && (
                          <p className="text-sm text-muted-foreground">{bucketStatus.error}</p>
                        )}
                      </div>
                    </div>
                    {getBucketStatusBadge(bucketStatus.exists)}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to create the required storage buckets in your Supabase dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              Open your{" "}
              <a
                href="https://supabase.com/dashboard/project/rttarliasydfffldayui/storage/buckets"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                Supabase Storage Dashboard
              </a>
            </span>
          </div>

          {setupInstructions.map((instruction, index) => (
            <div key={instruction.bucket}>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <h4 className="font-medium">Create '{instruction.bucket}' bucket</h4>
                <Badge variant={instruction.isPublic ? "secondary" : "outline"}>
                  {instruction.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              
              <div className="ml-8 space-y-2">
                <p className="text-sm text-muted-foreground">{instruction.description}</p>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Required Policies:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {instruction.policies.map((policy, policyIndex) => (
                      <li key={policyIndex} className="flex items-start gap-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{policy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {index < setupInstructions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notes</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                • Create buckets manually in the Supabase dashboard to avoid RLS policy violations
              </p>
              <p>
                • Set appropriate public/private access based on the bucket type
              </p>
              <p>
                • Configure Row Level Security (RLS) policies for proper user access control
              </p>
              <p>
                • Test file uploads after creating all buckets to ensure proper functionality
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
