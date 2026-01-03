// Types for Tax Certificates Module

export type CertificateType =
    | "RETENCION_FUENTE"
    | "IVA_RETENIDO"
    | "ICA_RETENIDO"
    | "INGRESOS_RETENCIONES";

export type CertificateStatus = "DRAFT" | "ISSUED" | "CANCELLED";

export type IdentificationType = "NIT" | "CC" | "CE" | "PASAPORTE";

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
    RETENCION_FUENTE: "Retención en la Fuente",
    IVA_RETENIDO: "IVA Retenido",
    ICA_RETENIDO: "ICA Retenido",
    INGRESOS_RETENCIONES: "Ingresos y Retenciones",
};

export const CERTIFICATE_STATUS_LABELS: Record<CertificateStatus, string> = {
    DRAFT: "Borrador",
    ISSUED: "Emitido",
    CANCELLED: "Anulado",
};

// Main Certificate Interface
export interface Certificate {
    id: string;
    certificateNumber: string;
    type: CertificateType;
    fiscalYear: number;

    // Issuer (empresa que emite el certificado)
    issuer: {
        nit: string;
        businessName: string;
        address: string;
        city: string;
        phone?: string;
        email?: string;
    };

    // Beneficiary (tercero que recibe el certificado)
    beneficiary: {
        identification: string; // NIT o CC
        identificationType: IdentificationType;
        name: string;
        address: string;
        city: string;
        phone?: string;
        email?: string;
    };

    // Details (varía según el tipo de certificado)
    details: RetencionFuenteDetail[] | IvaRetenidoDetail[] | IcaRetenidoDetail[] | IngresosRetencionesDetail;

    // Totals
    totals: {
        baseAmount: number;
        withheldAmount: number;
        additionalAmount?: number; // Para casos como IVA facturado
    };

    // Signatures
    accountant?: {
        name: string;
        identification: string;
        professionalCard: string;
        role: "CONTADOR" | "REVISOR_FISCAL";
    };

    // Notes
    notes?: string;

    // Audit
    status: CertificateStatus;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    issuedAt?: Date;
    issuedBy?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
    cancellationReason?: string;
}

// Retención en la Fuente Details
export interface RetencionFuenteDetail {
    id: string;
    concept: RetencionFuenteConcept;
    baseAmount: number;
    rate: number; // Percentage (e.g., 4 for 4%)
    withheldAmount: number;
    description?: string;
}

export type RetencionFuenteConcept =
    | "SERVICIOS"
    | "HONORARIOS"
    | "COMISIONES"
    | "ARRENDAMIENTOS"
    | "RENDIMIENTOS_FINANCIEROS"
    | "ENAJENACION_ACTIVOS"
    | "OTROS_INGRESOS"
    | "COMPRAS";

export const RETENCION_FUENTE_CONCEPT_LABELS: Record<RetencionFuenteConcept, string> = {
    SERVICIOS: "Servicios",
    HONORARIOS: "Honorarios",
    COMISIONES: "Comisiones",
    ARRENDAMIENTOS: "Arrendamientos",
    RENDIMIENTOS_FINANCIEROS: "Rendimientos Financieros",
    ENAJENACION_ACTIVOS: "Enajenación de Activos Fijos",
    OTROS_INGRESOS: "Otros Ingresos Tributarios",
    COMPRAS: "Compras",
};

// Tarifas de retención según normativa DIAN 2025
export const RETENCION_FUENTE_RATES: Record<RetencionFuenteConcept, number> = {
    SERVICIOS: 4,
    HONORARIOS: 11,
    COMISIONES: 11,
    ARRENDAMIENTOS: 3.5,
    RENDIMIENTOS_FINANCIEROS: 7,
    ENAJENACION_ACTIVOS: 1,
    OTROS_INGRESOS: 2.5,
    COMPRAS: 2.5,
};

// IVA Retenido Details
export interface IvaRetenidoDetail {
    id: string;
    date: Date;
    invoiceNumber: string;
    baseAmount: number;
    ivaRate: number; // 19% en Colombia
    ivaAmount: number;
    retentionRate: number; // 15% del IVA
    withheldAmount: number;
    description?: string;
}

// ICA Retenido Details
export interface IcaRetenidoDetail {
    id: string;
    concept: string;
    baseAmount: number;
    rate: number; // Varía por municipio y actividad
    withheldAmount: number;
    description?: string;
}

// Ingresos y Retenciones Details
export interface IngresosRetencionesDetail {
    // Ingresos laborales
    laboralIncome: {
        salary: number;
        bonuses: number;
        severance: number; // Cesantías
        interests: number; // Intereses sobre cesantías
        other: number;
    };

    // Ingresos no laborales
    nonLaboralIncome: {
        fees: number; // Honorarios
        services: number;
        other: number;
    };

    // Retenciones
    withholdings: {
        incomeTax: number; // Retención en la fuente
        health: number; // Salud
        pension: number; // Pensión
    };

    // Aportes voluntarios
    voluntaryContributions: {
        voluntaryPension: number;
        afc: number; // Ahorro para el Fomento de la Construcción
    };
}

// Certificate Creation Form Data
export interface CertificateFormData {
    type: CertificateType;
    fiscalYear: number;
    beneficiary: Certificate["beneficiary"];
    details: Certificate["details"];
    accountant?: Certificate["accountant"];
    notes?: string;
}
