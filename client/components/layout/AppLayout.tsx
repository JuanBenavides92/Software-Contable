import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  className?: string;
}

export function AppLayout({
  children,
  pageTitle = "Dashboard",
  className,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        pageTitle={pageTitle}
      />

      {/* Main Content */}
      <main
        className={cn(
          "md:ml-64 mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
