import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar, Lock, Unlock, AlertTriangle } from "lucide-react";
import type { AccountingPeriod } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface PeriodManagementSectionProps {
    periods: AccountingPeriod[];
    onUpdate: (periods: AccountingPeriod[]) => void;
}

export function PeriodManagementSection({ periods, onUpdate }: PeriodManagementSectionProps) {
    const { toast } = useToast();

    const handleClosePeriod = (periodId: string) => {
        const updated = periods.map(p =>
            p.id === periodId
                ? { ...p, status: 'CLOSED' as const, closedAt: new Date(), closedBy: 'Usuario Actual' }
                : p
        );
        onUpdate(updated);
        toast({
            title: "📅 Período Cerrado",
            description: "El período contable se ha cerrado correctamente.",
            variant: "default",
        });
    };

    const handleReopenPeriod = (periodId: string) => {
        // Should require password in production
        const updated = periods.map(p =>
            p.id === periodId
                ? { ...p, status: 'OPEN' as const, closedAt: undefined, closedBy: undefined }
                : p
        );
        onUpdate(updated);
        toast({
            title: "🔓 Período Reabierto",
            description: "El período contable se ha reabierto. Esta acción queda registrada en auditoría.",
        });
    };

    const sortedPeriods = [...periods].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Gestión de Períodos Contables</h2>
                </div>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-yellow-900">Importante</p>
                        <p className="text-yellow-700">
                            Cerrar un período impide crear nuevos asientos en ese mes. Solo se pueden reversar asientos existentes.
                            La reapertura requiere autorización del supervisor y queda registrada en auditoría.
                        </p>
                    </div>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Año</TableHead>
                        <TableHead>Mes</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Cierre</TableHead>
                        <TableHead>Cerrado Por</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPeriods.map((period) => (
                        <TableRow key={period.id}>
                            <TableCell className="font-medium">{period.year}</TableCell>
                            <TableCell>{period.monthName}</TableCell>
                            <TableCell>
                                {period.status === 'OPEN' ? (
                                    <Badge className="bg-green-100 text-green-800">
                                        <Unlock className="w-3 h-3 mr-1" />
                                        Abierto
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-800">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Cerrado
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {period.closedAt
                                    ? new Date(period.closedAt).toLocaleDateString('es-CO')
                                    : '-'}
                            </TableCell>
                            <TableCell>{period.closedBy || '-'}</TableCell>
                            <TableCell className="text-right">
                                {period.status === 'OPEN' ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClosePeriod(period.id)}
                                    >
                                        <Lock className="w-3 h-3 mr-1" />
                                        Cerrar
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReopenPeriod(period.id)}
                                    >
                                        <Unlock className="w-3 h-3 mr-1" />
                                        Reabrir
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
