// Journal Entry Types - Based on Colombian Accounting Requirements

export type EntryType = "OPENING" | "OPERATION" | "ADJUSTMENT" | "CLOSING";
export type EntryStatus = "DRAFT" | "POSTED" | "REVERSED";

export interface JournalEntry {
    // GENERAL INFORMATION
    id: string;
    entryNumber: number;                     // Consecutive number
    entryType: EntryType;
    date: Date;                              // Transaction date
    period: string;                          // Accounting period (e.g., "2025-01")

    // SUPPORTING DOCUMENT
    documentType: string;                    // Type (Invoice, Receipt, etc.)
    documentNumber: string;                  // Document number
    documentReference?: string;              // Additional reference

    // DESCRIPTION
    concept: string;                         // Main concept
    notes?: string;                          // Additional notes

    // ENTRY LINES
    lines: JournalEntryLine[];               // Debit/Credit details

    // CONTROL AND AUDIT
    status: EntryStatus;
    postedAt?: Date;                         // When it was posted
    postedBy?: string;                       // Who posted it
    reversedBy?: string;                     // ID of entry that reverses this

    // METADATA
    createdAt: Date;
    createdBy: string;                       // User who created it
    updatedAt: Date;
    updatedBy: string;

    // TOTALS (calculated)
    totalDebit: number;
    totalCredit: number;
}

export interface JournalEntryLine {
    id: string;
    lineNumber: number;                      // Line order

    // ACCOUNT
    accountId: string;                       // Account ID
    accountCode: string;                     // Code (for display)
    accountName: string;                     // Name (for display)

    // VALUES
    debit: number;                           // Debit value (0 if credit)
    credit: number;                          // Credit value (0 if debit)

    // OPTIONAL
    thirdPartyId?: string;                   // Customer/Supplier (if applicable)
    thirdPartyName?: string;                 // Third party name
    costCenterId?: string;                   // Cost center (if applicable)
    description?: string;                    // Line description
    taxBase?: number;                        // Tax base (if there are taxes)
    taxRate?: number;                        // Tax rate
}

// Helper types for creating new entries
export type NewJournalEntry = Omit<JournalEntry,
    "id" | "entryNumber" | "status" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "totalDebit" | "totalCredit"
>;

export type NewJournalEntryLine = Omit<JournalEntryLine, "id" | "lineNumber">;

// Validation result
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}

// Entry type labels (Spanish)
export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
    OPENING: "Apertura",
    OPERATION: "Operación",
    ADJUSTMENT: "Ajuste",
    CLOSING: "Cierre"
};

// Entry status labels (Spanish)
export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
    DRAFT: "Borrador",
    POSTED: "Contabilizado",
    REVERSED: "Reversado"
};

// Document types
export const DOCUMENT_TYPES = [
    "Factura",
    "Recibo",
    "Nota Débito",
    "Nota Crédito",
    "Comprobante de Egreso",
    "Comprobante de Ingreso",
    "Contrato",
    "Otro"
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];
