import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navigationItems } from "./Navigation";
import { ChevronDown, BarChart3, BookOpen, FileText, TrendingUp, CheckCircle2, CreditCard, Shield, Zap, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CompanySelector } from "@/components/shared/CompanySelector";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  BookOpen,
  FileText,
  TrendingUp,
  CheckCircle2,
  CreditCard,
  Shield,
  Zap,
  Settings,
};

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border/50 z-50 overflow-y-auto transition-all duration-300 md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-sidebar-border/30 bg-gradient-to-b from-sidebar-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center ring-2 ring-sidebar-primary/30 shadow-lg">
              <span className="text-sidebar-primary-foreground font-bold text-xl">
                📊
              </span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">
                ContaXpert
              </h1>
              <p className="text-xs text-sidebar-foreground/60 font-medium">Pro Edition</p>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <div className="px-4 py-4 border-b border-sidebar-border/30">
          <CompanySelector variant="sidebar" />
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-3 border-b border-sidebar-border/30">
            <p className="text-sm font-medium text-sidebar-foreground">
              {user.name || user.email?.split("@")[0]}
            </p>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">
              {user.role === "ADMIN" ? "Administrador" : "Contador"}
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = iconMap[item.iconName];

            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  </div>
                  {item.children && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                        expandedItems.includes(item.title) && "rotate-180"
                      )}
                    />
                  )}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-primary-foreground rounded-full" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border/30 mt-auto bg-gradient-to-t from-sidebar-primary/5 to-transparent">
          <Button
            onClick={() => {
              // TODO: implement actual logout
              onClose?.();
            }}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-sidebar-border/30 text-center">
          <p className="text-xs text-sidebar-foreground/40 font-medium">
            v1.0 • © 2024
          </p>
        </div>
      </aside>
    </>
  );
}
