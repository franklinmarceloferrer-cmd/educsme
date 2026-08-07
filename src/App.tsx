import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import Students from "./pages/Students";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import StudentProfile from "./pages/StudentProfile";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvite from "./pages/AcceptInvite";
import GSEResources from "./pages/GSEResources";
import GCSEContentManage from "./pages/GCSEContentManage";
import GCSEStudyTopic from "./pages/GCSEStudyTopic";
import NotFound from "./pages/NotFound";
import OAuthConsent from "./pages/OAuthConsent";
const queryClient = new QueryClient();

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red-light to-brand-blue-light">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Main App Layout component
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="edu-cms-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                <Route path="/invite/:token" element={<AcceptInvite />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Announcements />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <AppLayout>
                          <Students />
                        </AppLayout>
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Documents />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <AppLayout>
                          <Reports />
                        </AppLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AppLayout>
                        <UserManagement />
                      </AppLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <StudentProfile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/:id"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <AppLayout>
                        <StudentProfile />
                      </AppLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gse-resources"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GSEResources />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gcse-content-manage"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <AppLayout>
                        <GCSEContentManage />
                      </AppLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gcse-study/:subject/:topic"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GCSEStudyTopic />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
