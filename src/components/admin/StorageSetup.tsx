import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { StorageSetupInstructions } from "@/components/ui/storage-setup-instructions";
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
          )}
        </CardContent>
      </Card>

      <StorageSetupInstructions />
    </div>
  );
}
