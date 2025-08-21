import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardApi } from '@/lib/supabaseApi';
import { fileStorage } from '@/lib/fileStorage';
import { Users, Megaphone, FileText, Activity, Database, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [storageStatus, setStorageStatus] = useState<{ allReady: boolean; buckets: any } | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: dashboardApi.getRecentActivity,
  });

  // Check storage status for admins
  useEffect(() => {
    if (user?.role === 'admin') {
      fileStorage.getStorageStatus()
        .then(setStorageStatus)
        .catch(console.error)
        .finally(() => setStorageStatus(null));
    } else {
      setStorageLoading(false);
    }
  }, [user?.role]);

  const statsCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      description: "Active enrolled students",
    },
    {
      title: "Announcements",
      value: stats?.totalAnnouncements || 0,
      icon: Megaphone,
      description: "Published announcements",
    },
    {
      title: "Documents",
      value: stats?.totalDocuments || 0,
      icon: FileText,
      description: "Uploaded documents",
    },
    {
      title: "Total Posts",
      value: stats?.totalAnnouncements || 0,
      icon: Activity,
      description: "All announcements",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your educational management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Status Alert for Admins */}
      {user?.role === 'admin' && storageStatus && !storageStatus.allReady && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-800">Storage Configuration Required</p>
              <p className="text-sm text-orange-700 mt-1">
                Some storage buckets are missing. File upload features may not work correctly.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/admin/storage-setup', '_blank')}
              className="ml-4"
            >
              Fix Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {user?.role === 'admin' && storageStatus?.allReady && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <p className="font-medium text-green-800">Storage Configuration Complete</p>
            <p className="text-sm text-green-700 mt-1">
              All storage buckets are properly configured and ready for file uploads.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and changes in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {activity?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      by {item.user} • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}