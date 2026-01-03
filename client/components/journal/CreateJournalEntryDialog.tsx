import { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Search,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import type {
    JournalEntry,
    JournalEntryLine,
    EntryType,
    DocumentType
} from "@/types/journalEntry";
import {
    ENTRY_TYPE_LABELS,
    DOCUMENT_TYPES
} from "@/types/journalEntry";
import {
    validateJournalEntry,
    calculateEntryTotals
} from "@/utils/journalEntryValidation";

// Mock accounts from Chart of Accounts
interface Account {
    id: string;
    code: string;
    name: string;
    type: string;
    acceptsMovements: boolean;
}

const MOCK_ACCOUNTS: Account[] = [
    { id: "acc-1105", code: "1105", name: "Caja General", type: "ASSET", acceptsMovements: true },
    { id: "acc-1110", code: "1110", name: "Bancos", type: "ASSET", acceptsMovements: true },
    { id: "acc-1305", code: "1305", name: "Clientes", type: "ASSET", acceptsMovements: true },
    { id: "acc-1435", code: "1435", name: "Inventario de Mercancías", type: "ASSET", acceptsMovements: true },
    { id: "acc-1524", code: "1524", name: "Equipo de Oficina", type: "ASSET", acceptsMovements: true },
    { id: "acc-1592", code: "1592", name: "Depreciación Acumulada", type: "ASSET", acceptsMovements: true },
    { id: "acc-2205", code: "2205", name: "Proveedores", type: "LIABILITY", acceptsMovements: true },
    { id: "acc-2365", code: "2365", name: "Retención en la Fuente", type: "LIABILITY", acceptsMovements: true },
    { id: "acc-2408", code: "2408", name: "Impuesto sobre las Ventas por Pagar", type: "LIABILITY", acceptsMovements: true },
    { id: "acc-3105", code: "3105", name: "Capital Social", type: "EQUITY", acceptsMovements: true },
    { id: "acc-3605", code: "3605", name: "Utilidades Acumuladas", type: "EQUITY", acceptsMovements: true },
    { id: "acc-4135", code: "4135", name: "Comercio al por Mayor", type: "REVENUE", acceptsMovements: true },
    { id: "acc-4175", code: "4175", name: "Ingresos por Servicios", type: "REVENUE", acceptsMovements: true },
    { id: "acc-5105", code: "5105", name: "Gastos de Personal", type: "EXPENSE", acceptsMovements: true },
    { id: "acc-5120", code: "5120", name: "Arrendamientos", type: "EXPENSE", acceptsMovements: true },
    { id: "acc-5160", code: "5160", name: "Depreciación", type: "EXPENSE", acceptsMovements: true },
    { id: "acc-6135", code: "6135", name: "Costo de Mercancía Vendida", type: "EXPENSE", acceptsMovements: true },
];

interface CreateJournalEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (entry: Partial<JournalEntry>) => void;
    mode?: "create" | "edit";
    initialEntry?: JournalEntry;
}

interface FormLine {
    tempId: string;
    accountId: string;
    accountCode: string;
    accountName: string;
    type: "debit" | "credit";
    amount: string;
    description: string;
    searchTerm: string;
}

export function CreateJournalEntryDialog({
    open,
    onOpenChange,
    onSave,
    mode = "create",
    initialEntry
}: CreateJournalEntryDialogProps) {
    const [step, setStep] = useState(1);

    // Step 1: General Information
    const [entryType, setEntryType] = useState<EntryType>("OPERATION");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [documentType, setDocumentType] = useState<DocumentType>("Factura");
    const [documentNumber, setDocumentNumber] = useState("");
    const [concept, setConcept] = useState("");
    const [notes, setNotes] = useState("");

    // Pre-load data in edit mode
    useEffect(() => {
        if (mode === "edit" && initialEntry) {
            setEntryType(initialEntry.entryType);
            setDate(initialEntry.date.toISOString().split("T")[0]);
            setDocumentType(initialEntry.documentType as DocumentType);
            setDocumentNumber(initialEntry.documentNumber);
            setConcept(initialEntry.concept);
            setNotes(initialEntry.notes || "");

            // Convert lines to form format
            const formLines: FormLine[] = initialEntry.lines.map((line, index) => ({
                tempId: `edit-${line.id}-${index}`,
                accountId: line.accountId,
                accountCode: line.accountCode,
                accountName: line.accountName,
                type: line.debit > 0 ? "debit" : "credit",
                amount: (line.debit > 0 ? line.debit : line.credit).toString(),
                description: line.description || "",
                searchTerm: `${line.accountCode} - ${line.accountName}`
            }));
            setLines(formLines);
            setStep(1); // Reset to step 1 when editing
        }
    }, [mode, initialEntry, open]);

    // Step 2: Lines
    const [lines, setLines] = useState<FormLine[]>([
        {
            tempId: "1",
            accountId: "",
            accountCode: "",
            accountName: "",
            type: "debit",
            amount: "",
            description: "",
            searchTerm: ""
        },
        {
            tempId: "2",
            accountId: "",
            accountCode: "",
            accountName: "",
            type: "credit",
            amount: "",
            description: "",
            searchTerm: ""
        }
    ]);
    const [activeSearch, setActiveSearch] = useState<string | null>(null);

    // Calculate totals
    const totals = useMemo(() => {
        let totalDebit = 0;
        let totalCredit = 0;

        lines.forEach(line => {
            const amount = parseFloat(line.amount) || 0;
            if (line.type === "debit") {
                totalDebit += amount;
            } else {
                totalCredit += amount;
            }
        });

        const difference = Math.abs(totalDebit - totalCredit);
        const balanced = difference <= 0.01 && totalDebit > 0 && totalCredit > 0;

        return { totalDebit, totalCredit, difference, balanced };
    }, [lines]);

    // Validation
    const validation = useMemo(() => {
        // Convert form data to JournalEntry format for validation
        const entryLines: JournalEntryLine[] = lines
            .filter(line => line.accountId && parseFloat(line.amount) > 0)
            .map((line, index) => ({
                id: line.tempId,
                lineNumber: index + 1,
                accountId: line.accountId,
                accountCode: line.accountCode,
                accountName: line.accountName,
                debit: line.type === "debit" ? parseFloat(line.amount) : 0,
                credit: line.type === "credit" ? parseFloat(line.amount) : 0,
                description: line.description
            }));

        const entry: Partial<JournalEntry> = {
            entryType,
            date: new Date(date),
            documentType,
            documentNumber,
            concept,
            notes,
            lines: entryLines
        };

        return validateJournalEntry(entry);
    }, [entryType, date, documentType, documentNumber, concept, notes, lines]);

    const handleAddLine = () => {
        setLines([...lines, {
            tempId: Date.now().toString(),
            accountId: "",
            accountCode: "",
            accountName: "",
            type: "debit",
            amount: "",
            description: "",
            searchTerm: ""
        }]);
    };

    const handleRemoveLine = (tempId: string) => {
        if (lines.length > 2) {
            setLines(lines.filter(line => line.tempId !== tempId));
        }
    };

    const handleLineChange = (tempId: string, field: keyof FormLine, value: string) => {
        setLines(lines.map(line =>
            line.tempId === tempId ? { ...line, [field]: value } : line
        ));
    };

    const handleSelectAccount = (tempId: string, account: Account) => {
        setLines(lines.map(line =>
            line.tempId === tempId
                ? {
                    ...line,
                    accountId: account.id,
                    accountCode: account.code,
                    accountName: account.name,
                    searchTerm: `${account.code} - ${account.name}`
                }
                : line
        ));
        setActiveSearch(null);
    };

    const handleNext = () => {
        if (step === 1) {
            // Validate step 1
            if (!documentType || !documentNumber || !concept || !date) {
                alert("Por favor complete todos los campos obligatorios");
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSave = (asDraft: boolean) => {
        if (!validation.valid) {
            alert("El asiento tiene errores:\n\n" + validation.errors.join("\n"));
            return;
        }

        const entryLines: JournalEntryLine[] = lines
            .filter(line => line.accountId && parseFloat(line.amount) > 0)
            .map((line, index) => ({
                id: "",
                lineNumber: index + 1,
                accountId: line.accountId,
                accountCode: line.accountCode,
                accountName: line.accountName,
                debit: line.type === "debit" ? parseFloat(line.amount) : 0,
                credit: line.type === "credit" ? parseFloat(line.amount) : 0,
                description: line.description
            }));

        const newEntry: Partial<JournalEntry> = {
            entryType,
            date: new Date(date),
            period: date.substring(0, 7), // "2025-01"
            documentType,
            documentNumber,
            concept,
            notes,
            lines: entryLines,
            status: asDraft ? "DRAFT" : "POSTED",
            createdAt: new Date(),
            createdBy: "usuario@empresa.com", // TODO: Get from auth context
            updatedAt: new Date(),
            updatedBy: "usuario@empresa.com",
            totalDebit: totals.totalDebit,
            totalCredit: totals.totalCredit
        };

        onSave(newEntry);
        handleReset();
        onOpenChange(false);
    };

    const handleReset = () => {
        setStep(1);
        setEntryType("OPERATION");
        setDate(new Date().toISOString().split("T")[0]);
        setDocumentType("Factura");
        setDocumentNumber("");
        setConcept("");
        setNotes("");
        setLines([
            {
                tempId: "1",
                accountId: "",
                accountCode: "",
                accountName: "",
                type: "debit",
                amount: "",
                description: "",
                searchTerm: ""
            },
            {
                tempId: "2",
                accountId: "",
                accountCode: "",
                accountName: "",
                type: "credit",
                amount: "",
                description: "",
                searchTerm: ""
            }
        ]);
    };

    // Filter accounts based on search
    const getFilteredAccounts = (searchTerm: string): Account[] => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const term = searchTerm.toLowerCase();
        return MOCK_ACCOUNTS.filter(acc =>
            acc.code.includes(term) ||
            acc.name.toLowerCase().includes(term)
        ).slice(0, 8);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "create"
                            ? "Crear Nuevo Asiento Contable"
                            : `Editar Asiento #${initialEntry?.entryNumber.toString().padStart(6, "0")}`
                        }
                    </DialogTitle>
                    <DialogDescription>
                        Paso {step} de 3 - {step === 1 ? "Información General" : step === 2 ? "Líneas del Asiento" : "Revisión y Confirmación"}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3].map(num => (
                        <div key={num} className="flex items-center flex-1">
                            <div className={`h-2 flex-1 rounded ${num <= step ? "bg-primary" : "bg-gray-200"
                                }`} />
                        </div>
                    ))}
                </div>

                {/* Step 1: General Information */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="entryType">Tipo de Asiento *</Label>
                                <Select value={entryType} onValueChange={(v) => setEntryType(v as EntryType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ENTRY_TYPE_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date">Fecha *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="documentType">Tipo de Documento *</Label>
                                <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOCUMENT_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="documentNumber">Número de Documento *</Label>
                                <Input
                                    id="documentNumber"
                                    placeholder="Ej: FV-001"
                                    value={documentNumber}
                                    onChange={(e) => setDocumentNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="concept">Concepto *</Label>
                            <Textarea
                                id="concept"
                                placeholder="Descripción clara de la transacción..."
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Información adicional..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Entry Lines */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Líneas del Asiento</h3>
                            <Button onClick={handleAddLine} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Línea
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {lines.map((line, index) => (
                                <div key={line.tempId} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">Línea {index + 1}</span>
                                        {lines.length > 2 && (
                                            <Button
                                                onClick={() => handleRemoveLine(line.tempId)}
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Account Search */}
                                    <div className="relative">
                                        <Label>Cuenta Contable *</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Buscar cuenta por código o nombre..."
                                                value={line.searchTerm}
                                                onChange={(e) => {
                                                    handleLineChange(line.tempId, "searchTerm", e.target.value);
                                                    setActiveSearch(line.tempId);
                                                }}
                                                onFocus={() => setActiveSearch(line.tempId)}
                                                className={line.accountId ? "border-green-500" : ""}
                                            />
                                            <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                        </div>

                                        {/* Account Dropdown */}
                                        {activeSearch === line.tempId && line.searchTerm.length >= 2 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {getFilteredAccounts(line.searchTerm).map(account => (
                                                    <div
                                                        key={account.id}
                                                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                                                        onClick={() => handleSelectAccount(line.tempId, account)}
                                                    >
                                                        <div className="font-mono text-sm font-semibold">{account.code}</div>
                                                        <div className="text-sm text-muted-foreground">{account.name}</div>
                                                    </div>
                                                ))}
                                                {getFilteredAccounts(line.searchTerm).length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                                        No se encontraron cuentas
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Debit/Credit Selection */}
                                    <div>
                                        <Label>Tipo *</Label>
                                        <RadioGroup
                                            value={line.type}
                                            onValueChange={(v) => handleLineChange(line.tempId, "type", v)}
                                            className="flex gap-4 mt-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="debit" id={`debit-${line.tempId}`} />
                                                <Label htmlFor={`debit-${line.tempId}`} className="font-normal">
                                                    Débito
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="credit" id={`credit-${line.tempId}`} />
                                                <Label htmlFor={`credit-${line.tempId}`} className="font-normal">
                                                    Crédito
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <Label>Valor *</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={line.amount}
                                            onChange={(e) => handleLineChange(line.tempId, "amount", e.target.value)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label>Descripción (Opcional)</Label>
                                        <Input
                                            placeholder="Detalle de la línea..."
                                            value={line.description}
                                            onChange={(e) => handleLineChange(line.tempId, "description", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <Separator />
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-semibold mb-3">Totales</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Débitos</p>
                                    <p className="text-xl font-bold font-mono">
                                        ${totals.totalDebit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Créditos</p>
                                    <p className="text-xl font-bold font-mono">
                                        ${totals.totalCredit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xl font-bold font-mono ${totals.balanced ? "text-green-600" : "text-red-600"
                                            }`}>
                                            ${totals.difference.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                        </p>
                                        {totals.balanced ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {totals.balanced && (
                                <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-semibold">El asiento está balanceado (Partida Doble ✓)</span>
                                </div>
                            )}
                            {!totals.balanced && totals.totalDebit > 0 && (
                                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>El asiento NO cuadra. Ajuste los valores para que Débitos = Créditos</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Información General</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Tipo:</span> {ENTRY_TYPE_LABELS[entryType]}</div>
                                <div><span className="font-medium">Fecha:</span> {new Date(date).toLocaleDateString("es-CO")}</div>
                                <div><span className="font-medium">Documento:</span> {documentType} {documentNumber}</div>
                                <div><span className="font-medium">Concepto:</span> {concept}</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Líneas del Asiento</h3>
                            <div className="space-y-2">
                                {lines.filter(l => l.accountId && parseFloat(l.amount) > 0).map((line, index) => (
                                    <div key={line.tempId} className="flex items-center justify-between text-sm border-b pb-2">
                                        <div className="flex-1">
                                            <span className="font-mono font-semibold">{line.accountCode}</span>
                                            <span className="text-muted-foreground ml-2">{line.accountName}</span>
                                            {line.description && (
                                                <div className="text-xs text-muted-foreground">{line.description}</div>
                                            )}
                                        </div>
                                        <div className="flex gap-4 font-mono">
                                            <div className="w-32 text-right">
                                                {line.type === "debit" && `$${parseFloat(line.amount).toLocaleString("es-CO")}`}
                                            </div>
                                            <div className="w-32 text-right">
                                                {line.type === "credit" && `$${parseFloat(line.amount).toLocaleString("es-CO")}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between font-bold text-sm pt-2">
                                    <span>TOTALES:</span>
                                    <div className="flex gap-4 font-mono">
                                        <div className="w-32 text-right">
                                            ${totals.totalDebit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="w-32 text-right">
                                            ${totals.totalCredit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Validation Summary */}
                        {!validation.valid && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Errores de Validación
                                </h4>
                                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                    {validation.errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {validation.valid && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    El asiento es válido y está listo para guardar
                                </h4>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <DialogFooter className="flex items-center justify-between">
                    <div>
                        {step > 1 && (
                            <Button onClick={handleBack} variant="outline">
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Atrás
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onOpenChange(false)} variant="outline">
                            Cancelar
                        </Button>
                        {step < 3 ? (
                            <Button onClick={handleNext}>
                                Siguiente
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => handleSave(true)}
                                    variant="outline"
                                    disabled={!validation.valid}
                                >
                                    Guardar como Borrador
                                </Button>
                                <Button
                                    onClick={() => handleSave(false)}
                                    disabled={!validation.valid}
                                >
                                    Contabilizar
                                </Button>
                            </>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
