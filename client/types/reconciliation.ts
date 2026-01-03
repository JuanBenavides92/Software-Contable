// Bank Reconciliation Types

export type MovementSource = 'ACCOUNTING' | 'BANK';
export type MovementType = 'DEBIT' | 'CREDIT';
export type ReconciliationStatus = 'MATCHED' | 'PENDING' | 'IN_TRANSIT' | 'ERROR' | 'NOT_RECORDED';
export type ReconciliationProcessStatus = 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
export type DiscrepancyType = 'IN_TRANSIT' | 'NOT_RECORDED' | 'ERROR';
export type DiscrepancySubType =
    | 'CHECK_OUTSTANDING'
    | 'DEPOSIT_IN_TRANSIT'
    | 'BANK_CHARGE'
    | 'BANK_INTEREST'
    | 'OTHER';

// Bank Account
export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountType: 'SAVINGS' | 'CHECKING';
    currency: string;
    accountingAccountId: string;  // Link to chart of accounts (1105, etc.)
    isActive: boolean;
}

// Movement from accounting records
export interface AccountingMovement {
    id: string;
    date: Date;
    type: MovementType;
    amount: number;
    concept: string;
    documentType: string;
    documentNumber: string;
    journalEntryId?: string;
    status: ReconciliationStatus;
    matchedBankMovementId?: string;
}

// Movement from bank statement
export interface BankMovement {
    id: string;
    date: Date;
    valueDate?: Date;  // Fecha valor (cuando se hizo efectivo)
    type: MovementType;
    amount: number;
    concept: string;
    reference: string;
    balance?: number;  // Saldo después del movimiento
    status: ReconciliationStatus;
    matchedAccountingMovementId?: string;
}

// Matched pair
export interface MatchedMovement {
    id: string;
    accountingMovement: AccountingMovement;
    bankMovement: BankMovement;
    matchType: 'AUTOMATIC' | 'MANUAL';
    matchConfidence: number;  // 0-100%
    matchedAt: Date;
    matchedBy: string;
}

// Difference/Discrepancy
export interface Discrepancy {
    id: string;
    type: DiscrepancyType;
    subType?: DiscrepancySubType;
    source: MovementSource;
    movement: AccountingMovement | BankMovement;
    amount: number;
    notes?: string;
    requiresAdjustment: boolean;
}

// Reconciliation process
export interface BankReconciliation {
    id: string;
    bankAccountId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };

    // Balances
    openingBalanceAccounting: number;
    closingBalanceAccounting: number;
    openingBalanceBank: number;
    closingBalanceBank: number;

    // Movements
    accountingMovements: AccountingMovement[];
    bankMovements: BankMovement[];
    matchedMovements: MatchedMovement[];
    discrepancies: Discrepancy[];

    // Status
    status: ReconciliationProcessStatus;
    reconciledBalance: number;
    difference: number;  // Should be 0 when reconciled

    // Metadata
    createdAt: Date;
    createdBy: string;
    completedAt?: Date;
    approvedAt?: Date;
    approvedBy?: string;
}

// Labels
export const RECONCILIATION_STATUS_LABELS: Record<ReconciliationStatus, string> = {
    MATCHED: 'Conciliado',
    PENDING: 'Pendiente',
    IN_TRANSIT: 'En Tránsito',
    ERROR: 'Error',
    NOT_RECORDED: 'No Registrado',
};

export const DISCREPANCY_TYPE_LABELS: Record<DiscrepancyType, string> = {
    IN_TRANSIT: 'En Tránsito',
    NOT_RECORDED: 'No Registrado',
    ERROR: 'Error',
};

export const DISCREPANCY_SUBTYPE_LABELS: Record<DiscrepancySubType, string> = {
    CHECK_OUTSTANDING: 'Cheque No Cobrado',
    DEPOSIT_IN_TRANSIT: 'Depósito En Tránsito',
    BANK_CHARGE: 'Comisión Bancaria',
    BANK_INTEREST: 'Interés Bancario',
    OTHER: 'Otro',
};
