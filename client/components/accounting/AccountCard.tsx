import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AccountCardProps {
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  balance: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ASSET: "bg-blue-100 text-blue-800",
    LIABILITY: "bg-red-100 text-red-800",
    EQUITY: "bg-green-100 text-green-800",
    REVENUE: "bg-emerald-100 text-emerald-800",
    EXPENSE: "bg-orange-100 text-orange-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ASSET: "Activo",
    LIABILITY: "Pasivo",
    EQUITY: "Patrimonio",
    REVENUE: "Ingreso",
    EXPENSE: "Gasto",
  };
  return labels[type] || type;
}

export function AccountCard({
  code,
  name,
  type,
  balance,
  active = true,
  onClick,
  className = "",
}: AccountCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:bg-muted/50 ${className}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono font-semibold text-sm">{code}</p>
            <p className="font-medium mt-1">{name}</p>
          </div>
          {!active && <Badge variant="secondary">Inactiva</Badge>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge className={getTypeColor(type)}>
            {getTypeLabel(type)}
          </Badge>
          <p className="font-mono font-bold text-lg">
            ${balance.toLocaleString("es-CO")}
          </p>
        </div>
      </div>
    </Card>
  );
}
