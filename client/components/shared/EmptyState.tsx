import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`p-12 text-center space-y-4 ${className}`}>
      <div className="w-12 h-12 text-muted-foreground mx-auto">{icon}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </Card>
  );
}
