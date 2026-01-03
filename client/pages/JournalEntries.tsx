import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Search,
  Eye,
  Edit2,
  RotateCcw,
  Printer,
  Calendar,
  FileText
} from "lucide-react";
import { useState } from "react";
import type { JournalEntry, JournalEntryLine, EntryStatus, EntryType } from "@/types/journalEntry";
import { ENTRY_TYPE_LABELS, ENTRY_STATUS_LABELS } from "@/types/journalEntry";
import { formatEntryNumber } from "@/utils/journalEntryValidation";
import { CreateJournalEntryDialog } from "@/components/journal/CreateJournalEntryDialog";
import { ViewJournalEntryDialog } from "@/components/journal/ViewJournalEntryDialog";

// Mock data for demonstration
const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    entryNumber: 1,
    entryType: "OPERATION",
    date: new Date("2025-01-15"),
    period: "2025-01",
    documentType: "Factura",
    documentNumber: "FV-001",
    concept: "Venta de mercancía a cliente ABC",
    status: "POSTED",
    postedAt: new Date("2025-01-15T14:30:00"),
    postedBy: "admin@empresa.com",
    createdAt: new Date("2025-01-15T14:00:00"),
    createdBy: "admin@empresa.com",
    updatedAt: new Date("2025-01-15T14:30:00"),
    updatedBy: "admin@empresa.com",
    totalDebit: 1500000,
    totalCredit: 1500000,
    lines: [
      {
        id: "1-1",
        lineNumber: 1,
        accountId: "acc-1105",
        accountCode: "1105",
        accountName: "Caja General",
        debit: 1500000,
        credit: 0,
        description: "Recaudo efectivo"
      },
      {
        id: "1-2",
        lineNumber: 2,
        accountId: "acc-4135",
        accountCode: "4135",
        accountName: "Comercio al por Mayor",
        debit: 0,
        credit: 1500000,
        description: "Ingreso por venta"
      }
    ]
  },
  {
    id: "2",
    entryNumber: 2,
    entryType: "OPERATION",
    date: new Date("2025-01-16"),
    period: "2025-01",
    documentType: "Comprobante de Egreso",
    documentNumber: "CE-045",
    concept: "Pago de nómina quincenal",
    status: "POSTED",
    postedAt: new Date("2025-01-16T10:00:00"),
    postedBy: "admin@empresa.com",
    createdAt: new Date("2025-01-16T09:30:00"),
    createdBy: "admin@empresa.com",
    updatedAt: new Date("2025-01-16T10:00:00"),
    updatedBy: "admin@empresa.com",
    totalDebit: 3200000,
    totalCredit: 3200000,
    lines: [
      {
        id: "2-1",
        lineNumber: 1,
        accountId: "acc-5105",
        accountCode: "5105",
        accountName: "Gastos de Personal",
        debit: 3200000,
        credit: 0,
      },
      {
        id: "2-2",
        lineNumber: 2,
        accountId: "acc-1110",
        accountCode: "1110",
        accountName: "Bancos",
        debit: 0,
        credit: 3200000,
      }
    ]
  },
  {
    id: "3",
    entryNumber: 3,
    entryType: "ADJUSTMENT",
    date: new Date("2025-01-17"),
    period: "2025-01",
    documentType: "Comprobante",
    documentNumber: "COMP-003",
    concept: "Depreciación mensual de activos fijos",
    status: "DRAFT",
    createdAt: new Date("2025-01-17T11:00:00"),
    createdBy: "contador@empresa.com",
    updatedAt: new Date("2025-01-17T11:00:00"),
    updatedBy: "contador@empresa.com",
    totalDebit: 500000,
    totalCredit: 500000,
    lines: [
      {
        id: "3-1",
        lineNumber: 1,
        accountId: "acc-5160",
        accountCode: "5160",
        accountName: "Depreciación",
        debit: 500000,
        credit: 0,
      },
      {
        id: "3-2",
        lineNumber: 2,
        accountId: "acc-1592",
        accountCode: "1592",
        accountName: "Depreciación Acumulada",
        debit: 0,
        credit: 500000,
      }
    ]
  }
];

export { MOCK_ENTRIES };


function getStatusColor(status: EntryStatus): string {
  const colors: Record<EntryStatus, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    POSTED: "bg-green-100 text-green-800",
    REVERSED: "bg-gray-100 text-gray-800"
  };
  return colors[status];
}

function getTypeColor(type: EntryType): string {
  const colors: Record<EntryType, string> = {
    OPENING: "bg-blue-100 text-blue-800",
    OPERATION: "bg-purple-100 text-purple-800",
    ADJUSTMENT: "bg-orange-100 text-orange-800",
    CLOSING: "bg-red-100 text-red-800"
  };
  return colors[type];
}

export default function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.entryNumber.toString().includes(searchTerm) ||
      entry.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    const matchesType = filterType === "all" || entry.entryType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = (entry: JournalEntry) => {
    if (entry.status !== "DRAFT") {
      alert("Solo se pueden editar asientos en estado Borrador");
      return;
    }
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  const handleReverse = (entry: JournalEntry) => {
    if (entry.status !== "POSTED") {
      alert("Solo se pueden reversar asientos Contabilizados");
      return;
    }

    // Note: Once status is POSTED, it cannot be REVERSED yet (that happens after this function)
    // So we can proceed directly to confirmation

    if (confirm(`¿Está seguro de reversar el asiento ${formatEntryNumber(entry.entryNumber)}?\n\nEsto creará un asiento de reversión con las líneas invertidas.`)) {
      // Create reversal entry
      const newEntryNumber = Math.max(...entries.map(e => e.entryNumber), 0) + 1;
      const newId = (entries.length + 1).toString();

      // Invert lines: Debits <-> Credits
      const reversedLines: JournalEntryLine[] = entry.lines.map((line, index) => ({
        id: `rev-${line.id}`,
        lineNumber: index + 1,
        accountId: line.accountId,
        accountCode: line.accountCode,
        accountName: line.accountName,
        debit: line.credit, // Invert
        credit: line.debit, // Invert
        description: line.description
      }));

      const reversalEntry: JournalEntry = {
        id: newId,
        entryNumber: newEntryNumber,
        entryType: entry.entryType,
        date: new Date(),
        period: new Date().toISOString().substring(0, 7),
        documentType: entry.documentType,
        documentNumber: `REV-${entry.documentNumber}`,
        concept: `Reversión de Asiento #${formatEntryNumber(entry.entryNumber)} - ${entry.concept}`,
        notes: `Reversión automática del asiento original #${formatEntryNumber(entry.entryNumber)}`,
        lines: reversedLines,
        totalDebit: entry.totalCredit, // Swapped
        totalCredit: entry.totalDebit, // Swapped
        status: "POSTED",
        createdAt: new Date(),
        createdBy: "usuario@empresa.com",
        updatedAt: new Date(),
        updatedBy: "usuario@empresa.com",
        postedAt: new Date(),
        postedBy: "usuario@empresa.com",
        reversedBy: entry.id // Link to original
      };

      // Update original entry status
      const updatedEntries = entries.map(e =>
        e.id === entry.id
          ? {
            ...e,
            status: "REVERSED" as const,
            reversedBy: newId // Link to reversal entry
          }
          : e
      );

      // Add reversal entry at the top
      setEntries([reversalEntry, ...updatedEntries]);

      alert(`Asiento reversado exitosamente.\n\nAsiento de reversión: #${formatEntryNumber(newEntryNumber)}`);
    }
  };

  const handlePrint = (entry: JournalEntry) => {
    alert(`Imprimir comprobante del asiento ${formatEntryNumber(entry.entryNumber)}`);
  };

  return (
    <AppLayout pageTitle="Asientos Contables">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Asientos Contables</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión de transacciones contables - Sistema de Partida Doble
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Asiento
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Asientos</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Edit2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.status === "DRAFT").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contabilizados</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.status === "POSTED").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mes Actual</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.period === "2025-01").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, concepto o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="DRAFT">Borradores</SelectItem>
                <SelectItem value="POSTED">Contabilizados</SelectItem>
                <SelectItem value="REVERSED">Reversados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="OPENING">Apertura</SelectItem>
                <SelectItem value="OPERATION">Operación</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                <SelectItem value="CLOSING">Cierre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Entries Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Débito</TableHead>
                <TableHead className="text-right">Crédito</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron asientos contables
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono font-semibold">
                      {formatEntryNumber(entry.entryNumber)}
                    </TableCell>
                    <TableCell>
                      {entry.date.toLocaleDateString("es-CO")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(entry.entryType)}>
                        {ENTRY_TYPE_LABELS[entry.entryType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-medium">{entry.concept}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.documentType} {entry.documentNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${entry.totalDebit.toLocaleString("es-CO")}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${entry.totalCredit.toLocaleString("es-CO")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(entry.status)}>
                        {ENTRY_STATUS_LABELS[entry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(entry)}
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {entry.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                            className="text-blue-600"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {entry.status === "POSTED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReverse(entry)}
                            className="text-orange-600"
                            title="Reversar"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(entry)}
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Info Footer */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Sistema de Partida Doble</p>
              <p>
                Todos los asientos contables deben cumplir con el principio de partida doble:
                <strong> ∑ Débitos = ∑ Créditos</strong>. Los asientos en estado "Borrador" pueden
                editarse, mientras que los "Contabilizados" solo pueden reversarse creando un
                nuevo asiento.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create/Edit Entry Dialog */}
      <CreateJournalEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedEntry(null); // Clear selection when closing
          }
        }}
        mode={selectedEntry && selectedEntry.status === "DRAFT" ? "edit" : "create"}
        initialEntry={selectedEntry || undefined}
        onSave={(updatedEntry) => {
          if (selectedEntry && selectedEntry.status === "DRAFT") {
            // EDIT MODE: Update existing entry
            setEntries(entries.map(e =>
              e.id === selectedEntry.id
                ? {
                  ...updatedEntry,
                  id: selectedEntry.id,
                  entryNumber: selectedEntry.entryNumber,
                  createdAt: selectedEntry.createdAt,
                  createdBy: selectedEntry.createdBy,
                  updatedAt: new Date(),
                  updatedBy: updatedEntry.createdBy || "usuario@empresa.com",
                  postedAt: updatedEntry.status === "POSTED" ? new Date() : undefined,
                  postedBy: updatedEntry.status === "POSTED" ? updatedEntry.createdBy : undefined,
                } as JournalEntry
                : e
            ));
            setSelectedEntry(null);
          } else {
            // CREATE MODE: Add new entry
            const newId = (entries.length + 1).toString();
            const newEntryNumber = Math.max(...entries.map(e => e.entryNumber), 0) + 1;

            const completedEntry: JournalEntry = {
              ...updatedEntry,
              id: newId,
              entryNumber: newEntryNumber,
              postedAt: updatedEntry.status === "POSTED" ? new Date() : undefined,
              postedBy: updatedEntry.status === "POSTED" ? updatedEntry.createdBy : undefined,
            } as JournalEntry;

            setEntries([completedEntry, ...entries]);
          }
        }}
      />

      {/* View Entry Dialog */}
      <ViewJournalEntryDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        entry={selectedEntry}
      />
    </AppLayout>
  );
}
