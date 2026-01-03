import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ChevronDown, ChevronRight, Calendar, FileBarChart } from "lucide-react";
import type { JournalEntry } from "@/types/journalEntry";
import { ENTRY_TYPE_LABELS, ENTRY_STATUS_LABELS } from "@/types/journalEntry";
import { formatEntryNumber } from "@/utils/journalEntryValidation";

interface LibroDiarioProps {
    entries: JournalEntry[];
}

export function LibroDiario({ entries }: LibroDiarioProps) {
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

    // Filter entries by date range
    const filteredEntries = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return entries
            .filter((entry) => {
                const entryDate = new Date(entry.date);
                return entryDate >= start && entryDate <= end;
            })
            .sort((a, b) => {
                // Sort by date, then by entry number
                const dateCompare = a.date.getTime() - b.date.getTime();
                return dateCompare !== 0 ? dateCompare : a.entryNumber - b.entryNumber;
            });
    }, [entries, startDate, endDate]);

    // Calculate totals
    const totals = useMemo(() => {
        return filteredEntries.reduce(
            (acc, entry) => ({
                debit: acc.debit + entry.totalDebit,
                credit: acc.credit + entry.totalCredit,
                count: acc.count + 1,
            }),
            { debit: 0, credit: 0, count: 0 }
        );
    }, [filteredEntries]);

    const toggleExpand = (entryId: string) => {
        const newExpanded = new Set(expandedEntries);
        if (newExpanded.has(entryId)) {
            newExpanded.delete(entryId);
        } else {
            newExpanded.add(entryId);
        }
        setExpandedEntries(newExpanded);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FileBarChart className="w-6 h-6 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold">Libro Diario</h2>
                        <p className="text-sm text-muted-foreground">
                            Registro cronológico de todas las transacciones contables
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
                    <Button variant="outline" onClick={() => setExpandedEntries(new Set())}>
                        Contraer Todo
                    </Button>
                </div>

                {/* Summary */}
                <div className="mt-4 flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-muted-foreground">Total de asientos: </span>
                        <span className="font-semibold">{totals.count}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total débitos: </span>
                        <span className="font-semibold">
                            ${totals.debit.toLocaleString("es-CO")}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total créditos: </span>
                        <span className="font-semibold">
                            ${totals.credit.toLocaleString("es-CO")}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="w-24">Fecha</TableHead>
                            <TableHead className="w-24"># Asiento</TableHead>
                            <TableHead className="w-32">Tipo</TableHead>
                            <TableHead className="w-40">Documento</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead className="text-right w-32">Débito</TableHead>
                            <TableHead className="text-right w-32">Crédito</TableHead>
                            <TableHead className="w-32">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No se encontraron asientos en el rango de fechas seleccionado
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEntries.map((entry) => {
                                const isExpanded = expandedEntries.has(entry.id);
                                return (
                                    <>
                                        {/* Main Row */}
                                        <TableRow
                                            key={entry.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleExpand(entry.id)}
                                        >
                                            <TableCell>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {entry.date.toLocaleDateString("es-CO", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell className="font-mono font-semibold">
                                                {formatEntryNumber(entry.entryNumber)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {ENTRY_TYPE_LABELS[entry.entryType]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {entry.documentType} {entry.documentNumber}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {entry.concept}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                ${entry.totalDebit.toLocaleString("es-CO")}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                ${entry.totalCredit.toLocaleString("es-CO")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        entry.status === "POSTED"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }
                                                >
                                                    {ENTRY_STATUS_LABELS[entry.status]}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <TableRow key={`${entry.id}-detail`}>
                                                <TableCell colSpan={9} className="bg-muted/30 p-4">
                                                    <div className="space-y-3">
                                                        <div className="text-sm font-semibold">
                                                            Detalle de Líneas:
                                                        </div>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-12">#</TableHead>
                                                                    <TableHead className="w-24">Cuenta</TableHead>
                                                                    <TableHead>Nombre</TableHead>
                                                                    <TableHead>Descripción</TableHead>
                                                                    <TableHead className="text-right w-32">Débito</TableHead>
                                                                    <TableHead className="text-right w-32">Crédito</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {entry.lines.map((line) => (
                                                                    <TableRow key={line.id}>
                                                                        <TableCell className="text-muted-foreground">
                                                                            {line.lineNumber}
                                                                        </TableCell>
                                                                        <TableCell className="font-mono font-semibold">
                                                                            {line.accountCode}
                                                                        </TableCell>
                                                                        <TableCell>{line.accountName}</TableCell>
                                                                        <TableCell className="text-sm text-muted-foreground">
                                                                            {line.description || "-"}
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-mono">
                                                                            {line.debit > 0
                                                                                ? `$${line.debit.toLocaleString("es-CO")}`
                                                                                : "-"}
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-mono">
                                                                            {line.credit > 0
                                                                                ? `$${line.credit.toLocaleString("es-CO")}`
                                                                                : "-"}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Footer Totals */}
            {filteredEntries.length > 0 && (
                <Card className="p-6 bg-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">TOTALES DEL PERÍODO:</div>
                        <div className="flex items-center gap-8">
                            <div>
                                <span className="text-sm text-muted-foreground mr-2">Débitos:</span>
                                <span className="font-mono font-bold text-lg">
                                    ${totals.debit.toLocaleString("es-CO", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground mr-2">Créditos:</span>
                                <span className="font-mono font-bold text-lg">
                                    ${totals.credit.toLocaleString("es-CO", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            {Math.abs(totals.debit - totals.credit) <= 0.01 && (
                                <Badge className="bg-green-600">✓ Cuadrado</Badge>
                            )}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
