import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  FileText,
  Plus,
  Eye,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import type {
  Certificate,
  CertificateType,
  CertificateStatus,
} from "@/types/certificates";
import {
  CERTIFICATE_TYPE_LABELS,
  CERTIFICATE_STATUS_LABELS,
} from "@/types/certificates";
import {
  generateCertificateNumber,
  formatCertificateCurrency,
  formatNIT,
} from "@/utils/certificateValidation";
import { CreateCertificateDialog } from "@/components/certificates/CreateCertificateDialog";

// Mock data for demonstration
const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "1",
    certificateNumber: "CERT-RF-2025-00001",
    type: "RETENCION_FUENTE",
    fiscalYear: 2025,
    issuer: {
      nit: "900123456-7",
      businessName: "Mi Empresa S.A.S.",
      address: "Calle 123 #45-67",
      city: "Bogotá",
      phone: "601-2345678",
      email: "contabilidad@miempresa.com",
    },
    beneficiary: {
      identification: "79123456-5",
      identificationType: "CC",
      name: "Juan Pérez García",
      address: "Carrera 45 #12-34",
      city: "Bogotá",
    },
    details: [
      {
        id: "1-1",
        concept: "SERVICIOS",
        baseAmount: 10000000,
        rate: 4,
        withheldAmount: 400000,
      },
      {
        id: "1-2",
        concept: "HONORARIOS",
        baseAmount: 5000000,
        rate: 11,
        withheldAmount: 550000,
      },
    ],
    totals: {
      baseAmount: 15000000,
      withheldAmount: 950000,
    },
    accountant: {
      name: "María González",
      identification: "52987654-3",
      professionalCard: "123456-T",
      role: "CONTADOR",
    },
    status: "ISSUED",
    createdAt: new Date("2025-01-15"),
    createdBy: "admin@empresa.com",
    updatedAt: new Date("2025-01-15"),
    updatedBy: "admin@empresa.com",
    issuedAt: new Date("2025-01-15"),
    issuedBy: "admin@empresa.com",
  },
  {
    id: "2",
    certificateNumber: "CERT-IV-2025-00001",
    type: "IVA_RETENIDO",
    fiscalYear: 2025,
    issuer: {
      nit: "900123456-7",
      businessName: "Mi Empresa S.A.S.",
      address: "Calle 123 #45-67",
      city: "Bogotá",
    },
    beneficiary: {
      identification: "800456789-2",
      identificationType: "NIT",
      name: "Proveedor XYZ Ltda.",
      address: "Avenida 68 #90-12",
      city: "Medellín",
    },
    details: [
      {
        id: "2-1",
        date: new Date("2025-01-10"),
        invoiceNumber: "FV-001",
        baseAmount: 1000000,
        ivaRate: 19,
        ivaAmount: 190000,
        retentionRate: 15,
        withheldAmount: 28500,
      },
    ],
    totals: {
      baseAmount: 1000000,
      withheldAmount: 28500,
      additionalAmount: 190000,
    },
    status: "DRAFT",
    createdAt: new Date("2025-01-16"),
    createdBy: "admin@empresa.com",
    updatedAt: new Date("2025-01-16"),
    updatedBy: "admin@empresa.com",
  },
];

function getStatusColor(status: CertificateStatus): string {
  const colors: Record<CertificateStatus, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    ISSUED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status];
}

export default function TaxCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<CertificateType | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<CertificateStatus | "ALL">("ALL");
  const [filterYear, setFilterYear] = useState<number | "ALL">("ALL");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Get unique years from certificates
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(certificates.map((c) => c.fiscalYear)));
    return years.sort((a, b) => b - a);
  }, [certificates]);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.beneficiary.identification.includes(searchTerm);

      // Type filter
      const matchesType = filterType === "ALL" || cert.type === filterType;

      // Status filter
      const matchesStatus = filterStatus === "ALL" || cert.status === filterStatus;

      // Year filter
      const matchesYear = filterYear === "ALL" || cert.fiscalYear === filterYear;

      return matchesSearch && matchesType && matchesStatus && matchesYear;
    });
  }, [certificates, searchTerm, filterType, filterStatus, filterYear]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: certificates.length,
      issued: certificates.filter((c) => c.status === "ISSUED").length,
      draft: certificates.filter((c) => c.status === "DRAFT").length,
      totalWithheld: certificates.reduce((sum, c) => sum + c.totals.withheldAmount, 0),
    };
  }, [certificates]);

  const handleSaveCertificate = (
    certificateData: Omit<Certificate, "id" | "certificateNumber" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">
  ) => {
    // Generate consecutive number
    const typeCerts = certificates.filter((c) => c.type === certificateData.type);
    const consecutive = typeCerts.length + 1;

    const newCertificate: Certificate = {
      ...certificateData,
      id: Date.now().toString(),
      certificateNumber: generateCertificateNumber(
        certificateData.type,
        certificateData.fiscalYear,
        consecutive
      ),
      createdAt: new Date(),
      createdBy: "admin@empresa.com", // TODO: Get from auth context
      updatedAt: new Date(),
      updatedBy: "admin@empresa.com",
      issuedAt: certificateData.status === "ISSUED" ? new Date() : undefined,
      issuedBy: certificateData.status === "ISSUED" ? "admin@empresa.com" : undefined,
    };

    setCertificates([newCertificate, ...certificates]);
  };

  const handleView = (certificate: Certificate) => {
    alert(`Ver certificado: ${certificate.certificateNumber}`);
  };

  const handleDownload = (certificate: Certificate) => {
    alert(`Descargar PDF: ${certificate.certificateNumber}`);
  };

  return (
    <AppLayout pageTitle="Certificados Tributarios">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Certificados Tributarios</h1>
            <p className="text-muted-foreground mt-2">
              Gestión de certificados según normativa DIAN
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Generar Certificado
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Certificados</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Emitidos</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {stats.issued}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Borradores</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {stats.draft}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Retenido</div>
            <div className="text-2xl font-bold mt-1">
              {formatCertificateCurrency(stats.totalWithheld)}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, beneficiario o NIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as CertificateType | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los tipos</SelectItem>
                  <SelectItem value="RETENCION_FUENTE">
                    {CERTIFICATE_TYPE_LABELS.RETENCION_FUENTE}
                  </SelectItem>
                  <SelectItem value="IVA_RETENIDO">
                    {CERTIFICATE_TYPE_LABELS.IVA_RETENIDO}
                  </SelectItem>
                  <SelectItem value="ICA_RETENIDO">
                    {CERTIFICATE_TYPE_LABELS.ICA_RETENIDO}
                  </SelectItem>
                  <SelectItem value="INGRESOS_RETENCIONES">
                    {CERTIFICATE_TYPE_LABELS.INGRESOS_RETENCIONES}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as CertificateStatus | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="ISSUED">Emitido</SelectItem>
                  <SelectItem value="CANCELLED">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select
                value={filterYear.toString()}
                onValueChange={(value) => setFilterYear(value === "ALL" ? "ALL" : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Certificates Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40"># Certificado</TableHead>
                <TableHead className="w-48">Tipo</TableHead>
                <TableHead>Beneficiario</TableHead>
                <TableHead className="w-32">Año Fiscal</TableHead>
                <TableHead className="text-right w-32">Valor Retenido</TableHead>
                <TableHead className="w-32">Estado</TableHead>
                <TableHead className="w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
                      ? "No se encontraron certificados"
                      : "No hay certificados registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-mono font-semibold">
                      {certificate.certificateNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CERTIFICATE_TYPE_LABELS[certificate.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{certificate.beneficiary.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {certificate.beneficiary.identificationType}:{" "}
                          {formatNIT(certificate.beneficiary.identification)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{certificate.fiscalYear}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCertificateCurrency(certificate.totals.withheldAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(certificate.status)}>
                        {CERTIFICATE_STATUS_LABELS[certificate.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(certificate)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {certificate.status === "ISSUED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(certificate)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Create Certificate Dialog */}
        <CreateCertificateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSave={handleSaveCertificate}
        />
      </div>
    </AppLayout>
  );
}
