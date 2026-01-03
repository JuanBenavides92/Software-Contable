import type {
    Certificate,
    RetencionFuenteDetail,
    RetencionFuenteConcept,
    RETENCION_FUENTE_RATES,
} from "@/types/certificates";

/**
 * Validate Colombian NIT (Tax Identification Number)
 * Uses the check digit algorithm
 */
export function validateNIT(nit: string): boolean {
    // Remove hyphens and spaces
    const cleanNIT = nit.replace(/[-\s]/g, "");

    // Must be at least 9 digits (8 + 1 check digit)
    if (cleanNIT.length < 9) return false;

    // Extract number and check digit
    const number = cleanNIT.slice(0, -1);
    const checkDigit = parseInt(cleanNIT.slice(-1));

    // Validate they are all numbers
    if (!/^\d+$/.test(number) || isNaN(checkDigit)) return false;

    // Check digit calculation
    const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
    const startIndex = weights.length - number.length;

    let sum = 0;
    for (let i = 0; i < number.length; i++) {
        sum += parseInt(number[i]) * weights[startIndex + i];
    }

    const remainder = sum % 11;
    const calculatedCheckDigit = remainder > 1 ? 11 - remainder : remainder;

    return calculatedCheckDigit === checkDigit;
}

/**
 * Format NIT for display
 */
export function formatNIT(nit: string): string {
    const cleanNIT = nit.replace(/[-\s]/g, "");
    if (cleanNIT.length < 9) return nit;

    const number = cleanNIT.slice(0, -1);
    const checkDigit = cleanNIT.slice(-1);

    return `${number}-${checkDigit}`;
}

/**
 * Validate fiscal year
 */
export function validateFiscalYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    // Allow current year and up to 2 years in the past
    return year >= currentYear - 2 && year <= currentYear;
}

/**
 * Calculate withheld amount for Retención en la Fuente
 */
export function calculateRetencionFuente(
    baseAmount: number,
    rate: number
): number {
    return Math.round((baseAmount * rate) / 100);
}

/**
 * Validate Retención en la Fuente rate for a given concept
 */
export function validateRetencionRate(
    concept: RetencionFuenteConcept,
    rate: number,
    officialRates: typeof RETENCION_FUENTE_RATES
): boolean {
    const expectedRate = officialRates[concept];
    // Allow some tolerance for special cases (0.1%)
    return Math.abs(rate - expectedRate) <= 0.1;
}

/**
 * Calculate IVA retention (15% of IVA)
 */
export function calculateIvaRetencion(ivaAmount: number): number {
    return Math.round((ivaAmount * 15) / 100);
}

/**
 * Validate certificate totals
 */
export function validateCertificateTotals(
    details: RetencionFuenteDetail[],
    expectedTotal: number
): boolean {
    const calculatedTotal = details.reduce(
        (sum, detail) => sum + detail.withheldAmount,
        0
    );

    // Allow 1 peso difference due to rounding
    return Math.abs(calculatedTotal - expectedTotal) <= 1;
}

/**
 * Generate certificate number
 */
export function generateCertificateNumber(
    type: string,
    fiscalYear: number,
    consecutive: number
): string {
    const typeCode = {
        RETENCION_FUENTE: "RF",
        IVA_RETENIDO: "IV",
        ICA_RETENIDO: "IC",
        INGRESOS_RETENCIONES: "IR",
    }[type] || "XX";

    const paddedConsecutive = consecutive.toString().padStart(5, "0");
    return `CERT-${typeCode}-${fiscalYear}-${paddedConsecutive}`;
}

/**
 * Validate required fields for certificate issuance
 */
export function validateCertificateForIssuance(
    certificate: Partial<Certificate>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Issuer validation
    if (!certificate.issuer?.nit) {
        errors.push("NIT del emisor es requerido");
    } else if (!validateNIT(certificate.issuer.nit)) {
        errors.push("NIT del emisor es inválido");
    }

    if (!certificate.issuer?.businessName) {
        errors.push("Razón social del emisor es requerida");
    }

    // Beneficiary validation
    if (!certificate.beneficiary?.identification) {
        errors.push("Identificación del beneficiario es requerida");
    }

    if (!certificate.beneficiary?.name) {
        errors.push("Nombre del beneficiario es requerido");
    }

    // Fiscal year validation
    if (!certificate.fiscalYear) {
        errors.push("Año fiscal es requerido");
    } else if (!validateFiscalYear(certificate.fiscalYear)) {
        errors.push("Año fiscal inválido (debe ser año actual o hasta 2 años atrás)");
    }

    // Details validation
    if (!certificate.details || (Array.isArray(certificate.details) && certificate.details.length === 0)) {
        errors.push("Debe agregar al menos un detalle de retención");
    }

    // Totals validation
    if (!certificate.totals?.withheldAmount || certificate.totals.withheldAmount <= 0) {
        errors.push("El valor total retenido debe ser mayor a cero");
    }

    // Accountant validation (required for ISSUED status)
    if (!certificate.accountant?.name) {
        errors.push("Nombre del contador es requerido");
    }

    if (!certificate.accountant?.professionalCard) {
        errors.push("Tarjeta profesional del contador es requerida");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Format currency for Colombia
 */
export function formatCertificateCurrency(amount: number): string {
    return `$${amount.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
