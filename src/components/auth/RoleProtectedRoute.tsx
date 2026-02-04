import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AllowedRole = 'admin' | 'teacher' | 'student';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
  fallbackPath?: string;
}

/**
 * RoleProtectedRoute - Server-side role enforcement for protected routes
 * 
 * SECURITY NOTE: This component provides defense-in-depth by checking roles
 * before rendering protected content. The primary security layer is RLS policies
 * on the database which enforce access control at the data level.
 * 
 * This component prevents unauthorized users from accessing admin UI routes,
 * even if they manipulate client-side state. Any data they could access
 * would still be protected by RLS policies.
 */
export function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleProtectedRouteProps) {
  const { user, hasRole, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red-light to-brand-blue-light">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }
  
  // Check if user has any of the allowed roles
  const hasAccess = user && allowedRoles.some(role => hasRole(role));
  
  if (!hasAccess) {
    // Log unauthorized access attempt for audit trail
    console.warn(
      `[Security] Unauthorized route access attempt. User role: ${user?.role}, Required roles: ${allowedRoles.join(', ')}`
    );
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
}
