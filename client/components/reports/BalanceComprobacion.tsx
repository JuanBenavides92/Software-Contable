import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar, Scale, CheckCircle, AlertCircle } from "lucide-react";
import type { JournalEntry } from "@/types/journalEntry";
import { generateTrialBalance } from "@/utils/reportCalculations";

// Mock accounts from Chart of Accounts
const MOCK_ACCOUNTS = [
    { id: "acc-1105", code: "1105", name: "Caja General", type: "ASSET" },
    { id: "acc-1110", code: "1110", name: "Bancos", type: "ASSET" },
    { id: "acc-1305", code: "1305", name: "Clientes", type: "ASSET" },
    { id: "acc-1435", code: "1435", name: "Inventario de Mercancías", type: "ASSET" },
    { id: "acc-1524", code: "1524", name: "Equipo de Oficina", type: "ASSET" },
    { id: "acc-1592", code: "1592", name: "Depreciación Acumulada", type: "ASSET" },
    { id: "acc-2205", code: "2205", name: "Proveedores", type: "LIABILITY" },
    { id: "acc-2365", code: "2365", name: "Retención en la Fuente", type: "LIABILITY" },
    { id: "acc-2408", code: "2408", name: "Impuesto sobre las Ventas por Pagar", type: "LIABILITY" },
    { id: "acc-3105", code: "3105", name: "Capital Social", type: "EQUITY" },
    { id: "acc-3605", code: "3605", name: "Utilidades Acumuladas", type: "EQUITY" },
    { id: "acc-4135", code: "4135", name: "Comercio al por Mayor", type: "REVENUE" },
    { id: "acc-4175", code: "4175", name: "Ingresos por Servicios", type: "REVENUE" },
    { id: "acc-5105", code: "5105", name: "Gastos de Personal", type: "EXPENSE" },
    { id: "acc-5120", code: "5120", name: "Arrendamientos", type: "EXPENSE" },
    { id: "acc-5160", code: "5160", name: "Depreciación", type: "EXPENSE" },
    { id: "acc-6135", code: "6135", name: "Costo de Mercancía Vendida", type: "EXPENSE" },
];

interface BalanceComprobacionProps {
    entries: JournalEntry[];
}

export function BalanceComprobacion({ entries }: BalanceComprobacionProps) {
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

    // Generate trial balance
    const trialBalance = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return generateTrialBalance(start, end, entries, MOCK_ACCOUNTS);
    }, [entries, startDate, endDate]);

    const formatCurrency = (amount: number) => {
        if (amount === 0) return "-";
        return `$${amount.toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Scale className="w-6 h-6 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold">Balance de Comprobación</h2>
                        <p className="text-sm text-muted-foreground">
                            Resumen de saldos de todas las cuentas contables
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4" />
                            Fecha Inicio
                        </label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4" />
                            Fecha Fin
                        </label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                        {trialBalance.isBalanced ? (
                            <Badge className="bg-green-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Balance Cuadrado
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Descuadrado
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-4 text-sm text-muted-foreground">
                    Cuentas con movimiento: {trialBalance.accounts.length}
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Código</TableHead>
                                <TableHead>Nombre de Cuenta</TableHead>
                                <TableHead className="text-right w-32">Saldo Inicial Déb.</TableHead>
                                <TableHead className="text-right w-32">Saldo Inicial Créd.</TableHead>
                                <TableHead className="text-right w-32">Movimientos Déb.</TableHead>
                                <TableHead className="text-right w-32">Movimientos Créd.</TableHead>
                                <TableHead className="text-right w-32">Saldo Final Déb.</TableHead>
                                <TableHead className="text-right w-32">Saldo Final Créd.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trialBalance.accounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No se encontraron movimientos en el rango de fechas seleccionado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {trialBalance.accounts.map((account) => (
                                        <TableRow key={account.accountCode}>
                                            <TableCell className="font-mono font-semibold">
                                                {account.accountCode}
                                            </TableCell>
                                            <TableCell>{account.accountName}</TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                {formatCurrency(account.initialDebit)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                {formatCurrency(account.initialCredit)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                {formatCurrency(account.movementsDebit)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                {formatCurrency(account.movementsCredit)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm font-semibold">
                                                {formatCurrency(account.finalDebit)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm font-semibold">
                                                {formatCurrency(account.finalCredit)}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Totals Row */}
                                    <TableRow className="bg-primary/5 font-bold">
                                        <TableCell colSpan={2} className="text-right">
                                            TOTALES:
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(trialBalance.totals.initialDebit)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(trialBalance.totals.initialCredit)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(trialBalance.totals.movementsDebit)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(trialBalance.totals.movementsCredit)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(trialBalance.totals.finalDebit)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(trialBalance.totals.finalCredit)}
                                        </TableCell>
                                    </TableRow>
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Validation Summary */}
            {trialBalance.accounts.length > 0 && (
                <Card className={`p-6 ${trialBalance.isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {trialBalance.isBalanced ? (
                                <>
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div>
                                        <div className="font-semibold text-green-900">
                                            Balance Verificado ✓
                                        </div>
                                        <div className="text-sm text-green-700">
                                            Débitos = Créditos (Partida Doble cumplida)
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                    <div>
                                        <div className="font-semibold text-red-900">
                                            Balance Descuadrado
                                        </div>
                                        <div className="text-sm text-red-700">
                                            Diferencia: $
                                            {Math.abs(
                                                trialBalance.totals.finalDebit - trialBalance.totals.finalCredit
                                            ).toLocaleString("es-CO", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                                Período: {new Date(startDate).toLocaleDateString("es-CO")} -{" "}
                                {new Date(endDate).toLocaleDateString("es-CO")}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
