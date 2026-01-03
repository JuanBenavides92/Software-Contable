import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import type {
    Certificate,
    CertificateType,
    IdentificationType,
    RetencionFuenteDetail,
    RetencionFuenteConcept,
} from "@/types/certificates";
import {
    CERTIFICATE_TYPE_LABELS,
    RETENCION_FUENTE_CONCEPT_LABELS,
    RETENCION_FUENTE_RATES,
} from "@/types/certificates";
import {
    validateNIT,
    validateFiscalYear,
    calculateRetencionFuente,
    validateCertificateForIssuance,
    formatCertificateCurrency,
} from "@/utils/certificateValidation";

interface CreateCertificateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (certificate: Omit<Certificate, "id" | "certificateNumber" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">) => void;
}

interface FormDetail extends Omit<RetencionFuenteDetail, "id" | "withheldAmount"> {
    tempId: string;
}

export function CreateCertificateDialog({
    open,
    onOpenChange,
    onSave,
}: CreateCertificateDialogProps) {
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Beneficiary and period
    const [certificateType] = useState<CertificateType>("RETENCION_FUENTE");
    const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
    const [identificationType, setIdentificationType] = useState<IdentificationType>("NIT");
    const [identification, setIdentification] = useState("");
    const [beneficiaryName, setBeneficiaryName] = useState("");
    const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
    const [beneficiaryCity, setBeneficiaryCity] = useState("");

    // Step 2: Details
    const [details, setDetails] = useState<FormDetail[]>([]);
    const [showAddRow, setShowAddRow] = useState(false);
    const [newConcept, setNewConcept] = useState<RetencionFuenteConcept>("SERVICIOS");
    const [newBaseAmount, setNewBaseAmount] = useState("");
    const [newDescription, setNewDescription] = useState("");

    // Step 3: Signature
    const [accountantName, setAccountantName] = useState("");
    const [accountantId, setAccountantId] = useState("");
    const [professionalCard, setProfessionalCard] = useState("");
    const [notes, setNotes] = useState("");

    // Validation errors
    const [errors, setErrors] = useState<string[]>([]);

    const handleClose = () => {
        // Reset form
        setCurrentStep(1);
        setFiscalYear(new Date().getFullYear());
        setIdentificationType("NIT");
        setIdentification("");
        setBeneficiaryName("");
        setBeneficiaryAddress("");
        setBeneficiaryCity("");
        setDetails([]);
        setAccountantName("");
        setAccountantId("");
        setProfessionalCard("");
        setNotes("");
        setErrors([]);
        onOpenChange(false);
    };

    const handleNext = () => {
        const stepErrors: string[] = [];

        if (currentStep === 1) {
            // Validate beneficiary data
            if (!identification) stepErrors.push("Identificación del beneficiario es requerida");
            if (identificationType === "NIT" && !validateNIT(identification)) {
                stepErrors.push("NIT del beneficiario es inválido");
            }
            if (!beneficiaryName) stepErrors.push("Nombre del beneficiario es requerido");
            if (!beneficiaryAddress) stepErrors.push("Dirección del beneficiario es requerida");
            if (!beneficiaryCity) stepErrors.push("Ciudad del beneficiario es requerida");
            if (!validateFiscalYear(fiscalYear)) {
                stepErrors.push("Año fiscal inválido");
            }
        }

        if (currentStep === 2) {
            // Validate details
            if (details.length === 0) {
                stepErrors.push("Debe agregar al menos un detalle de retención");
            }
        }

        if (stepErrors.length > 0) {
            setErrors(stepErrors);
            return;
        }

        setErrors([]);
        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        setErrors([]);
        setCurrentStep(currentStep - 1);
    };

    const handleAddDetail = () => {
        if (!newBaseAmount || parseFloat(newBaseAmount) <= 0) {
            setErrors(["La base gravable debe ser mayor a cero"]);
            return;
        }

        const baseAmount = parseFloat(newBaseAmount);
        const rate = RETENCION_FUENTE_RATES[newConcept];
        const withheldAmount = calculateRetencionFuente(baseAmount, rate);

        const newDetail: FormDetail = {
            tempId: Date.now().toString(),
            concept: newConcept,
            baseAmount,
            rate,
            description: newDescription,
        };

        setDetails([...details, newDetail]);
        setNewBaseAmount("");
        setNewDescription("");
        setShowAddRow(false);
        setErrors([]);
    };

    const handleRemoveDetail = (tempId: string) => {
        setDetails(details.filter((d) => d.tempId !== tempId));
    };

    const calculateTotals = () => {
        const baseAmount = details.reduce((sum, d) => sum + d.baseAmount, 0);
        const withheldAmount = details.reduce(
            (sum, d) => sum + calculateRetencionFuente(d.baseAmount, d.rate),
            0
        );
        return { baseAmount, withheldAmount };
    };

    const handleSave = (status: "DRAFT" | "ISSUED") => {
        const totals = calculateTotals();

        // Convert FormDetails to RetencionFuenteDetail
        const finalDetails: RetencionFuenteDetail[] = details.map((d, index) => ({
            id: `detail-${index + 1}`,
            concept: d.concept,
            baseAmount: d.baseAmount,
            rate: d.rate,
            withheldAmount: calculateRetencionFuente(d.baseAmount, d.rate),
            description: d.description,
        }));

        const certificate: Omit<Certificate, "id" | "certificateNumber" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy"> = {
            type: certificateType,
            fiscalYear,
            issuer: {
                nit: "900123456-7", // TODO: Get from company settings
                businessName: "Mi Empresa S.A.S.",
                address: "Calle 123 #45-67",
                city: "Bogotá",
                phone: "601-2345678",
                email: "contabilidad@miempresa.com",
            },
            beneficiary: {
                identification,
                identificationType,
                name: beneficiaryName,
                address: beneficiaryAddress,
                city: beneficiaryCity,
            },
            details: finalDetails,
            totals: {
                baseAmount: totals.baseAmount,
                withheldAmount: totals.withheldAmount,
            },
            accountant: accountantName
                ? {
                    name: accountantName,
                    identification: accountantId,
                    professionalCard,
                    role: "CONTADOR",
                }
                : undefined,
            notes,
            status,
        };

        // Validate if issuing
        if (status === "ISSUED") {
            const validation = validateCertificateForIssuance(certificate as Certificate);
            if (!validation.valid) {
                setErrors(validation.errors);
                return;
            }
        }

        onSave(certificate);
        handleClose();
    };

    const totals = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Generar Certificado de Retención en la Fuente
                    </DialogTitle>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === currentStep
                                        ? "bg-primary text-primary-foreground"
                                        : step < currentStep
                                            ? "bg-green-600 text-white"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {step < currentStep ? "✓" : step}
                            </div>
                            <span className="text-sm font-medium">
                                {step === 1 && "Beneficiario"}
                                {step === 2 && "Detalles"}
                                {step === 3 && "Revisión"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Error Display */}
                {errors.length > 0 && (
                    <Card className="p-4 bg-red-50 border-red-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <div className="font-semibold text-red-900">
                                    Errores de validación
                                </div>
                                <ul className="text-sm text-red-700 mt-2 space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 1: Beneficiary */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Año Fiscal *</Label>
                                <Input
                                    type="number"
                                    value={fiscalYear}
                                    onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                                    min={new Date().getFullYear() - 2}
                                    max={new Date().getFullYear()}
                                />
                            </div>
                            <div>
                                <Label>Tipo de Certificado</Label>
                                <Input
                                    value={CERTIFICATE_TYPE_LABELS[certificateType]}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold mb-4">Datos del Beneficiario</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Tipo de Identificación *</Label>
                                    <Select
                                        value={identificationType}
                                        onValueChange={(value) => setIdentificationType(value as IdentificationType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NIT">NIT</SelectItem>
                                            <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                            <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                            <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Número de Identificación *</Label>
                                    <Input
                                        value={identification}
                                        onChange={(e) => setIdentification(e.target.value)}
                                        placeholder="900123456-7"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Nombre o Razón Social *</Label>
                                <Input
                                    value={beneficiaryName}
                                    onChange={(e) => setBeneficiaryName(e.target.value)}
                                    placeholder="Juan Pérez García o Empresa SAS"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Dirección *</Label>
                                    <Input
                                        value={beneficiaryAddress}
                                        onChange={(e) => setBeneficiaryAddress(e.target.value)}
                                        placeholder="Calle 123 #45-67"
                                    />
                                </div>
                                <div>
                                    <Label>Ciudad *</Label>
                                    <Input
                                        value={beneficiaryCity}
                                        onChange={(e) => setBeneficiaryCity(e.target.value)}
                                        placeholder="Bogotá"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Detalles de Retenciones</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddRow(!showAddRow)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Detalle
                            </Button>
                        </div>

                        {/* Add Row Form */}
                        {showAddRow && (
                            <Card className="p-4 bg-blue-50 border-blue-200">
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <Label>Concepto</Label>
                                        <Select
                                            value={newConcept}
                                            onValueChange={(value) => setNewConcept(value as RetencionFuenteConcept)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(RETENCION_FUENTE_CONCEPT_LABELS).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label} ({RETENCION_FUENTE_RATES[key as RetencionFuenteConcept]}%)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Base Gravable</Label>
                                        <Input
                                            type="number"
                                            value={newBaseAmount}
                                            onChange={(e) => setNewBaseAmount(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddDetail} className="w-full">
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Label>Descripción (opcional)</Label>
                                    <Input
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        placeholder="Información adicional"
                                    />
                                </div>
                            </Card>
                        )}

                        {/* Details Table */}
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Concepto</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">Base</TableHead>
                                        <TableHead className="text-right">Tarifa</TableHead>
                                        <TableHead className="text-right">Retención</TableHead>
                                        <TableHead className="w-16"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {details.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No hay detalles agregados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {details.map((detail) => {
                                                const withheld = calculateRetencionFuente(detail.baseAmount, detail.rate);
                                                return (
                                                    <TableRow key={detail.tempId}>
                                                        <TableCell>
                                                            {RETENCION_FUENTE_CONCEPT_LABELS[detail.concept]}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {detail.description || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {formatCertificateCurrency(detail.baseAmount)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {detail.rate}%
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono font-semibold">
                                                            {formatCertificateCurrency(withheld)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDetail(detail.tempId)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}

                                            {/* Totals Row */}
                                            <TableRow className="bg-primary/5 font-bold">
                                                <TableCell colSpan={2}>TOTALES:</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatCertificateCurrency(totals.baseAmount)}
                                                </TableCell>
                                                <TableCell></TableCell>
                                                <TableCell className="text-right font-mono text-lg">
                                                    {formatCertificateCurrency(totals.withheldAmount)}
                                                </TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}

                {/* Step 3: Review and Signature */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Resumen del Certificado</h3>

                        {/* Summary */}
                        <Card className="p-4 bg-blue-50 border-blue-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Beneficiario:</span>
                                    <div className="font-medium">{beneficiaryName}</div>
                                    <div className="text-muted-foreground">{identificationType}: {identification}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Año Fiscal:</span>
                                    <div className="font-medium">{fiscalYear}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Base:</span>
                                    <div className="font-semibold">{formatCertificateCurrency(totals.baseAmount)}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Retenido:</span>
                                    <div className="font-semibold text-lg">{formatCertificateCurrency(totals.withheldAmount)}</div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Detalles:</span>
                                    <div className="font-medium">{details.length} concepto(s) de retención</div>
                                </div>
                            </div>
                        </Card>

                        {/* Accountant Signature */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4">Firma del Contador</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre del Contador *</Label>
                                    <Input
                                        value={accountantName}
                                        onChange={(e) => setAccountantName(e.target.value)}
                                        placeholder="María González"
                                    />
                                </div>
                                <div>
                                    <Label>Cédula *</Label>
                                    <Input
                                        value={accountantId}
                                        onChange={(e) => setAccountantId(e.target.value)}
                                        placeholder="52987654"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Tarjeta Profesional *</Label>
                                <Input
                                    value={professionalCard}
                                    onChange={(e) => setProfessionalCard(e.target.value)}
                                    placeholder="123456-T"
                                />
                            </div>

                            <div className="mt-4">
                                <Label>Notas Adicionales (opcional)</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Información adicional sobre el certificado"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <div className="flex items-center gap-2">
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={handlePrevious}>
                                Anterior
                            </Button>
                        )}
                        {currentStep < 3 ? (
                            <Button onClick={handleNext}>Siguiente</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSave("DRAFT")}
                                >
                                    Guardar Borrador
                                </Button>
                                <Button onClick={() => handleSave("ISSUED")}>
                                    Emitir Certificado
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
