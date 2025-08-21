import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  LogOut,
  User
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
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout, switchRole, hasRole } = useAuth();
  const collapsed = state === "collapsed";
  
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || hasRole('admin') || hasRole('teacher')
  );

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
              <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => switchRole('admin')}>
                Admin User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('teacher')}>
                Teacher User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('student')}>
                Student User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
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