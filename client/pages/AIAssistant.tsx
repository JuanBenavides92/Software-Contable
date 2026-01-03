import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function AIAssistant() {
  return (
    <AppLayout pageTitle="Asistente IA">
      <div className="p-6">
        <Card className="p-12 text-center space-y-4">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Asistente IA</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Categorización automática de transacciones, análisis y recomendaciones.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Esta sección está siendo desarrollada.
            </p>
            <p className="text-sm font-medium text-primary">
              Continúa indicando qué quieres implementar en esta página.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Volver al Dashboard</Link>
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
