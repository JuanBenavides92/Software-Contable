import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileSpreadsheet, FileText, Download } from "lucide-react";
import type { ExportFormat, ExportOptions, ExportableModule } from "@/types/exports";
import { EXPORT_MODULE_LABELS, EXPORT_FORMAT_LABELS } from "@/types/exports";

interface ExportOptionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module: ExportableModule;
    availableFormats: ExportFormat[];
    onExport: (options: ExportOptions) => void;
}

export function ExportOptionsDialog({
    open,
    onOpenChange,
    module,
    availableFormats,
    onExport,
}: ExportOptionsDialogProps) {
    // Format selection
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(availableFormats[0]);

    // Date range
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    // Filters (for journal entries)
    const [includeDrafts, setIncludeDrafts] = useState(true);
    const [includePosted, setIncludePosted] = useState(true);
    const [includeReversed, setIncludeReversed] = useState(false);

    // Options
    const [includeDetails, setIncludeDetails] = useState(true);
    const [includeMetadata, setIncludeMetadata] = useState(false);

    const handleExport = () => {
        const status: ('DRAFT' | 'POSTED' | 'REVERSED')[] = [];
        if (includeDrafts) status.push('DRAFT');
        if (includePosted) status.push('POSTED');
        if (includeReversed) status.push('REVERSED');

        const options: ExportOptions = {
            format: selectedFormat,
            module,
            dateRange: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
            journalEntryFilters: module === 'JOURNAL_ENTRIES' ? { status } : undefined,
            includeDetails,
            includeMetadata,
            companyInfo: {
                nit: '900123456-7',
                businessName: 'Mi Empresa S.A.S.',
                address: 'Calle 123 #45-67, Bogotá',
            },
        };

        onExport(options);
        onOpenChange(false);
    };

    const getFormatIcon = (format: ExportFormat) => {
        switch (format) {
            case 'EXCEL':
                return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
            case 'PDF':
                return <FileText className="w-4 h-4 text-red-600" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Exportar {EXPORT_MODULE_LABELS[module]}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Format Selection */}
                    <div>
                        <Label className="mb-3 block">Formato de Exportación</Label>
                        <RadioGroup
                            value={selectedFormat}
                            onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
                        >
                            <div className="grid grid-cols-3 gap-4">
                                {availableFormats.map((format) => (
                                    <Card
                                        key={format}
                                        className={`p-4 cursor-pointer transition-all ${selectedFormat === format
                                                ? 'border-primary shadow-md'
                                                : 'hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedFormat(format)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={format} id={format} />
                                            <Label
                                                htmlFor={format}
                                                className="flex items-center gap-2 cursor-pointer flex-1"
                                            >
                                                {getFormatIcon(format)}
                                                <span className="font-medium">
                                                    {EXPORT_FORMAT_LABELS[format]}
                                                </span>
                                            </Label>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Date Range */}
                    <div>
                        <Label className="mb-3 block">Período a Exportar</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                                    Fecha Inicio
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                                    Fecha Fin
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filters - Only for Journal Entries */}
                    {module === 'JOURNAL_ENTRIES' && (
                        <div>
                            <Label className="mb-3 block">Estado de Asientos</Label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="drafts"
                                        checked={includeDrafts}
                                        onCheckedChange={(checked) => setIncludeDrafts(checked as boolean)}
                                    />
                                    <Label htmlFor="drafts" className="cursor-pointer">
                                        Borradores
                                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                                            DRAFT
                                        </Badge>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="posted"
                                        checked={includePosted}
                                        onCheckedChange={(checked) => setIncludePosted(checked as boolean)}
                                    />
                                    <Label htmlFor="posted" className="cursor-pointer">
                                        Contabilizados
                                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                                            POSTED
                                        </Badge>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="reversed"
                                        checked={includeReversed}
                                        onCheckedChange={(checked) => setIncludeReversed(checked as boolean)}
                                    />
                                    <Label htmlFor="reversed" className="cursor-pointer">
                                        Reversados
                                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                                            REVERSED
                                        </Badge>
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Export Options */}
                    <div>
                        <Label className="mb-3 block">Opciones Adicionales</Label>
                        <div className="space-y-3">
                            {module === 'JOURNAL_ENTRIES' && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="details"
                                        checked={includeDetails}
                                        onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                                    />
                                    <Label htmlFor="details" className="cursor-pointer">
                                        Incluir líneas de detalle (débitos/créditos por cuenta)
                                    </Label>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="metadata"
                                    checked={includeMetadata}
                                    onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                                />
                                <Label htmlFor="metadata" className="cursor-pointer">
                                    Incluir información de auditoría (usuario, fechas de creación)
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1 text-sm">
                                <div className="font-semibold text-blue-900">Información</div>
                                <p className="text-blue-700 mt-1">
                                    {selectedFormat === 'EXCEL' && 'El archivo Excel incluirá todas las columnas con formato profesional y auto-tamaño.'}
                                    {selectedFormat === 'CSV' && 'El archivo CSV es compatible con cualquier software y utiliza codificación UTF-8.'}
                                    {selectedFormat === 'PDF' && 'El archivo PDF incluirá encabezados oficiales y paginación automática.'}
                                    {selectedFormat === 'XML' && 'El archivo XML cumple con el formato oficial DIAN para medios magnéticos.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
