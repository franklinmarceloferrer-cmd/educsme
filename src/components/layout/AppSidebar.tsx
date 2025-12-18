import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  LogOut,
  User,
  UserCog
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Navigation items configuration
 * 
 * SECURITY NOTE: The 'adminOnly' flag is used for UI filtering only (UX improvement).
 * Actual security enforcement is handled by:
 * 1. RoleProtectedRoute component - blocks unauthorized route access
 * 2. RLS policies on database - enforces data access control server-side
 * 
 * Hiding menu items improves UX but is NOT a security measure.
 */
const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: UserCog,
    adminExclusive: true, // Only admins, not teachers
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut, hasRole } = useAuth();
  const collapsed = state === "collapsed";
  
  // NOTE: This filtering is for UX only. Security is enforced by RoleProtectedRoute and RLS policies.
  const filteredNavigation = navigation.filter(item => {
    if (item.adminExclusive) return hasRole('admin');
    if (item.adminOnly) return hasRole('admin') || hasRole('teacher');
    return true;
  });

  const getNavClasses = (url: string) => {
    const isActive = location.pathname === url;
    return isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "";
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">E</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">EduCMS</h2>
              <p className="text-xs text-sidebar-foreground/60">Educational Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <User className="h-4 w-4" />
                {!collapsed && (
                  <div className="flex flex-col items-start ml-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Role: {user.role}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}