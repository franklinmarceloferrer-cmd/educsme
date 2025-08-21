import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { fileStorage } from "@/lib/fileStorage";

interface StorageStatusProps {
  showDetails?: boolean;
}

export function StorageStatus({ showDetails = false }: StorageStatusProps) {
  const [status, setStatus] = useState<{ allReady: boolean; buckets: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const storageStatus = await fileStorage.getStorageStatus();
        setStatus(storageStatus);
      } catch (error) {
        console.error("Failed to check storage status:", error);
        setStatus({ allReady: false, buckets: {} });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!status) {
    return null; // Don't show anything if we couldn't check status
  }

  if (status.allReady) {
    return showDetails ? (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Storage Ready</AlertTitle>
        <AlertDescription className="text-green-700">
          All storage buckets are properly configured for file uploads.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Storage Setup Required</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="text-orange-700">
            Some storage buckets are missing. File upload features may not work correctly.
          </p>
          {showDetails && (
            <p className="text-sm text-orange-600 mt-1">
              Create the missing buckets manually in your Supabase dashboard.
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://supabase.com/dashboard/project/rttarliasydfffldayui/storage/buckets', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Dashboard
          </Button>
          {showDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/docs/supabase-storage-setup.md', '_blank')}
            >
              Setup Guide
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
