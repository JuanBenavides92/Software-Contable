import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { ReconciliationWizard } from "@/components/reconciliation/ReconciliationWizard";
import type { BankReconciliation } from "@/types/reconciliation";

interface ReconciliationSummary {
  id: string;
  bankName: string;
  accountNumber: string;
  period: string;
  status: 'completed' | 'in_progress' | 'approved';
  difference: number;
  matchedCount: number;
  totalCount: number;
  completedAt?: Date;
}

const MOCK_RECONCILIATIONS: ReconciliationSummary[] = [
  {
    id: 'rec-1',
    bankName: 'Banco de Bogotá',
    accountNumber: '123456789',
    period: 'Diciembre 2024',
    status: 'approved',
    difference: 0,
    matchedCount: 52,
    totalCount: 52,
    completedAt: new Date('2025-01-05'),
  },
  {
    id: 'rec-2',
    bankName: 'Banco Popular',
    accountNumber: '987654321',
    period: 'Diciembre 2024',
    status: 'completed',
    difference: 0,
    matchedCount: 38,
    totalCount: 38,
    completedAt: new Date('2025-01-06'),
  },
];

export default function BankReconciliation() {
  const [showNewReconciliation, setShowNewReconciliation] = useState(false);

  const getStatusBadge = (status: ReconciliationSummary['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completada
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En Progreso
          </Badge>
        );
    }
  };

  const getDifferenceBadge = (difference: number) => {
    if (difference === 0) {
      return (
        <span className="text-green-600 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          $0
        </span>
      );
    }
    return (
      <span className="text-red-600 font-semibold flex items-center gap-1">
        <AlertTriangle className="w-4 h-4" />
        ${difference.toLocaleString('es-CO')}
      </span>
    );
  };

  return (
    <AppLayout pageTitle="Conciliación Bancaria">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conciliación Bancaria</h1>
            <p className="text-muted-foreground mt-2">
              Compara y reconcilia tus movimientos bancarios con los registros contables
            </p>
          </div>
          <Button onClick={() => setShowNewReconciliation(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Conciliación
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">¿Qué es la Conciliación Bancaria?</h3>
              <p className="text-sm text-blue-700">
                Es el proceso de comparar los movimientos registrados en tus libros contables con el extracto bancario
                para identificar diferencias, partidas en tránsito y posibles errores. Este control es esencial para
                mantener la integridad de tus registros financieros.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-blue-900">✓ Verificación</div>
                  <div className="text-blue-600">Confirma la exactitud de registros</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-900">✓ Control</div>
                  <div className="text-blue-600">Previene fraudes y errores</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-900">✓ Cumplimiento</div>
                  <div className="text-blue-600">Normativa contable colombiana</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Reconciliations List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Conciliaciones Recientes</h2>

          {MOCK_RECONCILIATIONS.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay conciliaciones</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera conciliación bancaria para comenzar
              </p>
              <Button onClick={() => setShowNewReconciliation(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Conciliación
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_RECONCILIATIONS.map((rec) => (
                <Card key={rec.id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{rec.bankName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Cuenta {rec.accountNumber.slice(-4).padStart(rec.accountNumber.length, '*')}
                      </p>
                    </div>
                    {getStatusBadge(rec.status)}
                  </div>

                  {/* Period */}
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">Período</div>
                    <div className="font-medium">{rec.period}</div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-muted-foreground">Movimientos</div>
                      <div className="font-semibold">
                        {rec.matchedCount}/{rec.totalCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Diferencia</div>
                      <div>{getDifferenceBadge(rec.difference)}</div>
                    </div>
                  </div>

                  {/* Completed date */}
                  {rec.completedAt && (
                    <div className="text-xs text-muted-foreground mb-4">
                      Completada: {rec.completedAt.toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* New Reconciliation Wizard */}
        <ReconciliationWizard
          open={showNewReconciliation}
          onOpenChange={setShowNewReconciliation}
          onComplete={(reconciliation) => {
            console.log('Conciliación completada:', reconciliation);
            // TODO: Save and update list
          }}
        />
      </div>
    </AppLayout>
  );
}
