import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        // For now, auto-login for demo purposes
        // In a real app, this would show a login page
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📊</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">ContaXpert</h1>
        <p className="text-lg text-muted-foreground mt-2">Sistema Contable Profesional</p>
        <p className="text-sm text-muted-foreground mt-4">Cargando aplicación...</p>
      </div>
    </div>
  );
}
