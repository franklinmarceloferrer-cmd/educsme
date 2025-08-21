import { StorageSetup } from "@/components/admin/StorageSetup";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function StorageSetupPage() {
  const { user } = useAuth();

  // Only allow admins to access this page
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Storage Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure Supabase storage buckets for file upload functionality
        </p>
      </div>
      
      <StorageSetup />
    </div>
  );
}
