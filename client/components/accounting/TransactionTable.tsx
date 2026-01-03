import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye } from "lucide-react";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  account?: string;
  debit?: number;
  credit?: number;
  amount?: number;
  type?: "in" | "out";
  status?: "pending" | "completed" | "reversed";
}

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  onView?: (transaction: Transaction) => void;
  showActions?: boolean;
  isLoading?: boolean;
}

function getStatusColor(status?: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    reversed: "bg-gray-100 text-gray-800",
  };
  return colors[status || "completed"] || "bg-gray-100 text-gray-800";
}

function getStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    completed: "Completado",
    reversed: "Reversado",
  };
  return labels[status || "completed"] || status || "";
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  isLoading = false,
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Cargando transacciones...</p>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay transacciones disponibles</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-semibold">Fecha</th>
              <th className="p-4 text-left font-semibold">Descripción</th>
              <th className="p-4 text-left font-semibold">Cuenta</th>
              <th className="p-4 text-right font-semibold">Débito</th>
              <th className="p-4 text-right font-semibold">Crédito</th>
              {onEdit || onDelete || onView ? (
                <th className="p-4 text-right font-semibold">Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="p-4 text-sm font-mono">{transaction.date}</td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    {transaction.status && (
                      <Badge
                        className={`mt-2 ${getStatusColor(transaction.status)}`}
                      >
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm">{transaction.account || "-"}</td>
                <td className="p-4 text-right text-sm font-mono">
                  {transaction.debit
                    ? `$${transaction.debit.toLocaleString("es-CO")}`
                    : "-"}
                </td>
                <td className="p-4 text-right text-sm font-mono">
                  {transaction.credit
                    ? `$${transaction.credit.toLocaleString("es-CO")}`
                    : "-"}
                </td>
                {showActions && (onEdit || onDelete || onView) ? (
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(transaction)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(transaction)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(transaction.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
