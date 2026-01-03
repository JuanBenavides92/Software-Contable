import type { JournalEntry, JournalEntryLine, ValidationResult } from "@/types/journalEntry";

/**
 * Validates a journal entry according to Colombian accounting requirements
 * - Double-entry bookkeeping: Sum of debits must equal sum of credits
 * - Minimum 2 lines
 * - All values must be positive
 * - Required fields validation
 */
export function validateJournalEntry(entry: Partial<JournalEntry>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!entry.concept || entry.concept.trim() === "") {
        errors.push("El concepto es obligatorio");
    }

    if (!entry.documentType) {
        errors.push("El tipo de documento es obligatorio");
    }

    if (!entry.documentNumber || entry.documentNumber.trim() === "") {
        errors.push("El número de documento es obligatorio");
    }

    if (!entry.date) {
        errors.push("La fecha es obligatoria");
    }

    // Check lines
    if (!entry.lines || entry.lines.length < 2) {
        errors.push("El asiento debe tener al menos 2 líneas");
    }

    if (entry.lines && entry.lines.length > 0) {
        // Validate each line
        entry.lines.forEach((line, index) => {
            if (!line.accountId) {
                errors.push(`Línea ${index + 1}: Debe seleccionar una cuenta`);
            }

            if (line.debit === 0 && line.credit === 0) {
                errors.push(`Línea ${index + 1}: Debe tener un valor en débito o crédito`);
            }

            if (line.debit > 0 && line.credit > 0) {
                errors.push(`Línea ${index + 1}: No puede tener débito y crédito al mismo tiempo`);
            }

            if (line.debit < 0 || line.credit < 0) {
                errors.push(`Línea ${index + 1}: Los valores no pueden ser negativos`);
            }
        });

        // CRITICAL: Validate double-entry bookkeeping (Partida Doble)
        const totalDebits = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredits = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

        const difference = Math.abs(totalDebits - totalCredits);
        const tolerance = 0.01; // Allow 1 cent difference due to rounding

        if (difference > tolerance) {
            errors.push(
                `El asiento no cuadra: Débitos ($${totalDebits.toLocaleString("es-CO", { minimumFractionDigits: 2 })}) ≠ Créditos ($${totalCredits.toLocaleString("es-CO", { minimumFractionDigits: 2 })}). Diferencia: $${difference.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`
            );
        }

        // Warnings
        if (difference > 0 && difference <= tolerance) {
            warnings.push(`Diferencia menor de redondeo detectada: $${difference.toFixed(2)}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
}

/**
 * Calculate totals for a journal entry
 */
export function calculateEntryTotals(lines: JournalEntryLine[]): {
    totalDebit: number;
    totalCredit: number;
    balanced: boolean;
    difference: number;
} {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const balanced = difference <= 0.01;

    return {
        totalDebit,
        totalCredit,
        balanced,
        difference
    };
}

/**
 * Format entry number with leading zeros
 * Example: 1 -> "001", 123 -> "123"
 */
export function formatEntryNumber(num: number): string {
    return num.toString().padStart(6, "0");
}

/**
 * Check if an entry can be edited
 * Only DRAFT entries can be edited
 */
export function canEditEntry(entry: JournalEntry): boolean {
    return entry.status === "DRAFT";
}

/**
 * Check if an entry can be reversed
 * Only POSTED entries can be reversed
 */
export function canReverseEntry(entry: JournalEntry): boolean {
    return entry.status === "POSTED" && !entry.reversedBy;
}

/**
 * Check if an entry can be deleted
 * Only DRAFT entries can be deleted
 */
export function canDeleteEntry(entry: JournalEntry): boolean {
    return entry.status === "DRAFT";
}
