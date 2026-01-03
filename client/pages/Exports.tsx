import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileSpreadsheet,
  BarChart3,
  FileCheck,
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import type { ExportableModule, ExportFormat, ExportOptions } from "@/types/exports";
import { EXPORT_MODULE_LABELS } from "@/types/exports";
import { ExportOptionsDialog } from "@/components/exports/ExportOptionsDialog";
import { exportJournalEntries } from "@/utils/journalEntryExporter";
import { MOCK_ENTRIES } from "./JournalEntries";
import { useToast } from "@/hooks/use-toast";

interface ExportCardData {
  id: ExportableModule;
  title: string;
  description: string;
  icon: React.ReactNode;
  formats: ExportFormat[];
  enabled: boolean;
  comingSoon?: boolean;
}

const EXPORT_CARDS: ExportCardData[] = [
  {
    id: "JOURNAL_ENTRIES",
    title: "Asientos Contables",
    description: "Exporta todos tus asientos contables con líneas de detalle, totales y auditoría.",
    icon: <FileText className="w-8 h-8" />,
    formats: ["EXCEL", "CSV", "PDF"],
    enabled: true,
  },
  {
    id: "REPORTS_DIARIO",
    title: "Libro Diario",
    description: "Genera el Libro Diario oficial con todos los asientos del período.",
    icon: <FileSpreadsheet className="w-8 h-8" />,
    formats: ["EXCEL", "PDF"],
    enabled: true,
  },
  {
    id: "REPORTS_BALANCE",
    title: "Balance de Comprobación",
    description: "Exporta el Balance de Comprobación con saldos iniciales, movimientos y saldos finales.",
    icon: <BarChart3 className="w-8 h-8" />,
    formats: ["EXCEL", "PDF"],
    enabled: true,
  },
  {
    id: "REPORTS_MAYOR",
    title: "Libro Mayor",
    description: "Consulta y exporta el movimiento detallado de una cuenta específica.",
    icon: <FileCheck className="w-8 h-8" />,
    formats: ["EXCEL", "PDF"],
    enabled: true,
  },
  {
    id: "CHART_OF_ACCOUNTS",
    title: "Plan de Cuentas",
    description: "Exporta la estructura completa del plan de cuentas con códigos y saldos.",
    icon: <Database className="w-8 h-8" />,
    formats: ["EXCEL", "CSV"],
    enabled: false,
    comingSoon: true,
  },
  {
    id: "DIAN_MEDIOS_MAGNETICOS",
    title: "Medios Magnéticos DIAN",
    description: "Genera archivos XML con información exógena tributaria según normativa DIAN.",
    icon: <Database className="w-8 h-8" />,
    formats: ["XML"],
    enabled: false,
    comingSoon: true,
  },
];

const FORMAT_ICONS: Record<ExportFormat, { label: string; color: string }> = {
  EXCEL: { label: "Excel", color: "bg-green-100 text-green-800" },
  CSV: { label: "CSV", color: "bg-blue-100 text-blue-800" },
  PDF: { label: "PDF", color: "bg-red-100 text-red-800" },
  XML: { label: "XML", color: "bg-purple-100 text-purple-800" },
};

export default function Exports() {
  const [selectedModule, setSelectedModule] = useState<ExportableModule | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExportCardData | null>(null);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const { toast } = useToast();

  const handleExport = (moduleId: ExportableModule) => {
    const card = EXPORT_CARDS.find((c) => c.id === moduleId);
    if (!card) return;

    setSelectedModule(moduleId);
    setSelectedCard(card);
    setShowOptionsDialog(true);
  };

  const handleExportWithOptions = (options: ExportOptions) => {
    let result;

    try {
      // Execute export based on module
      switch (options.module) {
        case "JOURNAL_ENTRIES":
          result = exportJournalEntries(MOCK_ENTRIES, options);
          break;

        case "REPORTS_DIARIO":
        case "REPORTS_BALANCE":
        case "REPORTS_MAYOR":
          toast({
            title: "Exportación de Reportes",
            description: "Esta funcionalidad estará disponible próximamente.",
            variant: "default",
          });
          return;

        default:
          toast({
            title: "Error",
            description: "Módulo de exportación no implementado",
            variant: "destructive",
          });
          return;
      }

      // Show result
      if (result.success) {
        toast({
          title: "✅ Exportación Exitosa",
          description: `Archivo ${result.fileName} descargado correctamente. ${result.recordCount} registros exportados.`,
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Error en Exportación",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al exportar",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout pageTitle="Exportaciones">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Exportaciones</h1>
          <p className="text-muted-foreground mt-2">
            Exporta datos contables a diferentes formatos para análisis, auditoría y cumplimiento tributario
          </p>
        </div>

        {/* Stats/Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <Download className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Formatos Disponibles</h3>
              <p className="text-sm text-blue-700 mt-1">
                Exporta a Excel para análisis detallado, CSV para importación a otros sistemas,
                o PDF para reportes oficiales y presentación. Los archivos se descargan directamente a tu computador.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-green-600">Excel (.xlsx)</Badge>
                <Badge className="bg-blue-600">CSV (.csv)</Badge>
                <Badge className="bg-red-600">PDF (.pdf)</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Export Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPORT_CARDS.map((card) => (
            <Card
              key={card.id}
              className={`p-6 hover:shadow-lg transition-shadow ${!card.enabled ? 'opacity-60' : ''
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {card.icon}
                </div>
                {card.comingSoon && (
                  <Badge variant="outline" className="text-xs">
                    Próximamente
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {card.description}
              </p>

              {/* Format badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {card.formats.map((format) => (
                  <Badge
                    key={format}
                    variant="outline"
                    className={`text-xs ${FORMAT_ICONS[format].color}`}
                  >
                    {FORMAT_ICONS[format].label}
                  </Badge>
                ))}
              </div>

              {/* Export button */}
              <Button
                className="w-full"
                onClick={() => handleExport(card.id)}
                disabled={!card.enabled}
              >
                <Download className="w-4 h-4 mr-2" />
                {card.enabled ? 'Exportar' : 'No disponible'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Help/Info Section */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">💡 Información Importante</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary mt-0.5">•</span>
              <span>
                <strong>Excel (.xlsx):</strong> Ideal para análisis detallado, permite filtros y fórmulas.
                Compatible con Microsoft Excel, Google Sheets y LibreOffice Calc.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary mt-0.5">•</span>
              <span>
                <strong>CSV (.csv):</strong> Formato universal para importar/exportar datos entre sistemas.
                Texto plano compatible con cualquier software.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary mt-0.5">•</span>
              <span>
                <strong>PDF (.pdf):</strong> Formato oficial para reportes contables y presentación.
                No editable, ideal para auditorías y archivo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary mt-0.5">•</span>
              <span>
                <strong>XML DIAN:</strong> Formato oficial para medios magnéticos según normativa colombiana.
                Requerido para declaraciones tributarias.
              </span>
            </li>
          </ul>
        </Card>

        {/* Export Options Dialog */}
        {selectedCard && selectedModule && (
          <ExportOptionsDialog
            open={showOptionsDialog}
            onOpenChange={setShowOptionsDialog}
            module={selectedModule}
            availableFormats={selectedCard.formats}
            onExport={handleExportWithOptions}
          />
        )}
      </div>
    </AppLayout>
  );
}
