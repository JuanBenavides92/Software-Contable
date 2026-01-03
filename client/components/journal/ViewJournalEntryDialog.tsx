import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    FileText,
    User,
    Clock,
    Printer
} from "lucide-react";
import type { JournalEntry } from "@/types/journalEntry";
import {
    ENTRY_TYPE_LABELS,
    ENTRY_STATUS_LABELS
} from "@/types/journalEntry";
import { formatEntryNumber } from "@/utils/journalEntryValidation";

interface ViewJournalEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: JournalEntry | null;
    onPrint?: () => void;
}

export function ViewJournalEntryDialog({
    open,
    onOpenChange,
    entry,
    onPrint
}: ViewJournalEntryDialogProps) {
    if (!entry) return null;

    const statusColors = {
        DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
        POSTED: "bg-green-100 text-green-800 border-green-300",
        REVERSED: "bg-gray-100 text-gray-800 border-gray-300"
    };

    const typeColors = {
        OPENING: "bg-blue-100 text-blue-800 border-blue-300",
        OPERATION: "bg-purple-100 text-purple-800 border-purple-300",
        ADJUSTMENT: "bg-orange-100 text-orange-800 border-orange-300",
        CLOSING: "bg-red-100 text-red-800 border-red-300"
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">
                                Asiento Contable #{formatEntryNumber(entry.entryNumber)}
                            </DialogTitle>
                            <DialogDescription>
                                Detalle completo de la transacción contable
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={`${typeColors[entry.entryType]} border`}>
                                {ENTRY_TYPE_LABELS[entry.entryType]}
                            </Badge>
                            <Badge className={`${statusColors[entry.status]} border`}>
                                {ENTRY_STATUS_LABELS[entry.status]}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {/* General Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Información General
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Fecha de Transacción
                            </p>
                            <p className="font-medium">
                                {entry.date.toLocaleDateString("es-CO", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Período Contable</p>
                            <p className="font-medium">{entry.period}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                            <p className="font-medium">{entry.documentType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Número de Documento</p>
                            <p className="font-medium font-mono">{entry.documentNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Concept and Notes */}
                <div>
                    <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">Concepto</p>
                        <p className="text-base">{entry.concept}</p>
                    </div>
                    {entry.notes && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Notas Adicionales</p>
                            <p className="text-sm text-muted-foreground italic">{entry.notes}</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Entry Lines Table */}
                <div>
                    <h3 className="font-semibold mb-3">Detalle de Líneas</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-12">#</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-24">Código</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Cuenta</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Descripción</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 w-32">Débito</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 w-32">Crédito</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.lines.map((line, index) => (
                                    <tr
                                        key={line.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {line.lineNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-semibold">
                                                {line.accountCode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {line.accountName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {line.description || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm">
                                            {line.debit > 0
                                                ? `$${line.debit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`
                                                : "-"
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm">
                                            {line.credit > 0
                                                ? `$${line.credit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`
                                                : "-"
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right font-semibold">
                                        TOTALES:
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-base">
                                        ${entry.totalDebit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-base">
                                        ${entry.totalCredit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Balance Check */}
                    <div className="mt-2 flex items-center justify-end gap-2">
                        {Math.abs(entry.totalDebit - entry.totalCredit) <= 0.01 ? (
                            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                ✓ Partida Doble Verificada
                            </p>
                        ) : (
                            <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                                ⚠ Advertencia: El asiento no cuadra
                            </p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Audit Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Información de Auditoría
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1 mb-1">
                                <User className="w-3 h-3" />
                                Creado por
                            </p>
                            <p className="font-medium">{entry.createdBy}</p>
                            <p className="text-xs text-muted-foreground">
                                {entry.createdAt.toLocaleDateString("es-CO")} {entry.createdAt.toLocaleTimeString("es-CO")}
                            </p>
                        </div>

                        {entry.updatedBy && (
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1 mb-1">
                                    <User className="w-3 h-3" />
                                    Modificado por
                                </p>
                                <p className="font-medium">{entry.updatedBy}</p>
                                <p className="text-xs text-muted-foreground">
                                    {entry.updatedAt?.toLocaleDateString("es-CO")} {entry.updatedAt?.toLocaleTimeString("es-CO")}
                                </p>
                            </div>
                        )}

                        {entry.status === "POSTED" && entry.postedBy && (
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1 mb-1">
                                    <User className="w-3 h-3" />
                                    Contabilizado por
                                </p>
                                <p className="font-medium">{entry.postedBy}</p>
                                <p className="text-xs text-muted-foreground">
                                    {entry.postedAt?.toLocaleDateString("es-CO")} {entry.postedAt?.toLocaleTimeString("es-CO")}
                                </p>
                            </div>
                        )}

                        {entry.reversedBy && (
                            <div className="col-span-2">
                                <p className="text-orange-600 font-medium">
                                    ⚠ Este asiento fue reversado
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Asiento de reversión: #{entry.reversedBy}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        ID: {entry.id}
                    </div>
                    <div className="flex gap-2">
                        {onPrint && (
                            <Button onClick={onPrint} variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir
                            </Button>
                        )}
                        <Button onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
