import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/theme-provider";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 flex items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h2 className="text-lg font-semibold">Educational CMS</h2>
          <p className="text-xs text-muted-foreground">Management System</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}