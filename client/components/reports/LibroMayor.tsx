import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar, BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import type { JournalEntry } from "@/types/journalEntry";
import {
    calculateInitialBalance,
    getAccountMovements,
} from "@/utils/reportCalculations";
import { formatEntryNumber } from "@/utils/journalEntryValidation";

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

interface LibroMayorProps {
    entries: JournalEntry[];
}

export function LibroMayor({ entries }: LibroMayorProps) {
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    // Get selected account data
    const selectedAccount = useMemo(() => {
        return MOCK_ACCOUNTS.find((acc) => acc.id === selectedAccountId);
    }, [selectedAccountId]);

    // Calculate account movements
    const accountData = useMemo(() => {
        if (!selectedAccountId) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const initialBalance = calculateInitialBalance(selectedAccountId, start, entries);
        const movements = getAccountMovements(selectedAccountId, start, end, entries);
        const finalBalance = movements.length > 0
            ? movements[movements.length - 1].balance
            : initialBalance;

        return {
            initialBalance,
            movements,
            finalBalance,
        };
    }, [selectedAccountId, startDate, endDate, entries]);

    const formatCurrency = (amount: number) => {
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
                    <BookOpen className="w-6 h-6 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold">Libro Mayor</h2>
                        <p className="text-sm text-muted-foreground">
                            Movimientos detallados por cuenta contable
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Cuenta Contable *
                        </label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una cuenta..." />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_ACCOUNTS.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        <span className="font-mono font-semibold">{account.code}</span>
                                        {" - "}
                                        <span>{account.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
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
                    <div>
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
                </div>
            </Card>

            {/* Account Header */}
            {selectedAccount && accountData && (
                <Card className="p-6 bg-primary/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Cuenta</div>
                            <div className="text-2xl font-bold">
                                <span className="font-mono">{selectedAccount.code}</span>
                                {" - "}
                                <span>{selectedAccount.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                Tipo: {selectedAccount.type}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Saldo Inicial</div>
                            <div className="text-2xl font-bold font-mono flex items-center gap-2">
                                {accountData.initialBalance >= 0 ? (
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                )}
                                {formatCurrency(Math.abs(accountData.initialBalance))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {accountData.initialBalance >= 0 ? "Débito" : "Crédito"}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Movements Table */}
            {!selectedAccountId ? (
                <Card className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold">Seleccione una cuenta</p>
                    <p className="text-muted-foreground">
                        Elija una cuenta del plan de cuentas para ver sus movimientos
                    </p>
                </Card>
            ) : accountData && accountData.movements.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="text-lg font-semibold">Sin movimientos</p>
                    <p className="text-muted-foreground">
                        No hay movimientos registrados en el período seleccionado
                    </p>
                </Card>
            ) : (
                accountData && (
                    <>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Fecha</TableHead>
                                        <TableHead className="w-24"># Asiento</TableHead>
                                        <TableHead>Concepto</TableHead>
                                        <TableHead className="text-right w-32">Débito</TableHead>
                                        <TableHead className="text-right w-32">Crédito</TableHead>
                                        <TableHead className="text-right w-32">Saldo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Initial Balance Row */}
                                    <TableRow className="bg-muted/30 font-semibold">
                                        <TableCell colSpan={3}>SALDO INICIAL</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {accountData.initialBalance > 0
                                                ? formatCurrency(accountData.initialBalance)
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {accountData.initialBalance < 0
                                                ? formatCurrency(Math.abs(accountData.initialBalance))
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(Math.abs(accountData.initialBalance))}
                                        </TableCell>
                                    </TableRow>

                                    {/* Movement Rows */}
                                    {accountData.movements.map((movement, index) => (
                                        <TableRow key={`${movement.entryNumber}-${index}`}>
                                            <TableCell>
                                                {movement.date.toLocaleDateString("es-CO", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell className="font-mono font-semibold">
                                                {formatEntryNumber(movement.entryNumber)}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {movement.concept}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {movement.debit > 0 ? formatCurrency(movement.debit) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {movement.credit > 0 ? formatCurrency(movement.credit) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {formatCurrency(Math.abs(movement.balance))}
                                                <span className="text-xs ml-1 text-muted-foreground">
                                                    {movement.balance >= 0 ? "D" : "C"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Final Balance Row */}
                                    <TableRow className="bg-primary/5 font-bold">
                                        <TableCell colSpan={3}>SALDO FINAL</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {accountData.finalBalance > 0
                                                ? formatCurrency(accountData.finalBalance)
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {accountData.finalBalance < 0
                                                ? formatCurrency(Math.abs(accountData.finalBalance))
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-lg">
                                            {formatCurrency(Math.abs(accountData.finalBalance))}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Summary Card */}
                        <Card className="p-6 bg-blue-50 border-blue-200">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Movimientos
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {accountData.movements.length}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Débitos
                                    </div>
                                    <div className="text-2xl font-bold font-mono">
                                        {formatCurrency(
                                            accountData.movements.reduce((sum, m) => sum + m.debit, 0)
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Créditos
                                    </div>
                                    <div className="text-2xl font-bold font-mono">
                                        {formatCurrency(
                                            accountData.movements.reduce((sum, m) => sum + m.credit, 0)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </>
                )
            )}
        </div>
    );
}
