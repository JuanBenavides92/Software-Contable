import { Menu, X, LogOut, Settings, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { CompanySelector } from "@/components/shared/CompanySelector";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  pageTitle?: string;
}

export function Header({
  sidebarOpen,
  onSidebarToggle,
  pageTitle = "Dashboard",
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-border/50 z-40 flex items-center justify-between px-6 transition-all duration-300",
        sidebarOpen ? "left-64 md:left-64" : "left-0 md:left-64"
      )}
    >
      {/* Left Section - Menu Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-foreground tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Bienvenido a ContaXpert</p>
        </div>
      </div>

      {/* Middle Section - Company Selector */}
      <div className="hidden lg:block flex-1 ml-8">
        <CompanySelector variant="header" />
      </div>

      {/* Right Section - Notifications & User Menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted transition-colors duration-200"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-xs font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-foreground">
                {user?.name || user?.email?.split("@")[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 border-b">
              <p className="text-sm font-medium">{user?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
