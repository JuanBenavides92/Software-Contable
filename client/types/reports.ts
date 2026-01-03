// Types for Reports Module

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface ReportFilters {
    dateRange: DateRange;
    accountIds?: string[];
    entryTypes?: string[];
    status?: string[];
}

// Libro Diario Types
export interface DiarioEntry {
    id: string;
    entryNumber: number;
    date: Date;
    entryType: string;
    documentType: string;
    documentNumber: string;
    concept: string;
    totalDebit: number;
    totalCredit: number;
    status: string;
    lines: DiarioLine[];
}

export interface DiarioLine {
    lineNumber: number;
    accountCode: string;
    accountName: string;
    description?: string;
    debit: number;
    credit: number;
}

// Libro Mayor Types
export interface MayorAccount {
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    initialBalance: number;
    movements: MayorMovement[];
    finalBalance: number;
}

export interface MayorMovement {
    date: Date;
    entryNumber: number;
    concept: string;
    debit: number;
    credit: number;
    balance: number;
}

// Balance de Comprobación Types
export interface TrialBalanceAccount {
    accountCode: string;
    accountName: string;
    accountType: string;
    initialDebit: number;
    initialCredit: number;
    movementsDebit: number;
    movementsCredit: number;
    finalDebit: number;
    finalCredit: number;
}

export interface TrialBalanceData {
    accounts: TrialBalanceAccount[];
    totals: {
        initialDebit: number;
        initialCredit: number;
        movementsDebit: number;
        movementsCredit: number;
        finalDebit: number;
        finalCredit: number;
    };
    isBalanced: boolean;
}

// Estado de Resultados Types
export interface IncomeStatementData {
    revenues: CategoryTotal;
    costOfSales: CategoryTotal;
    grossProfit: number;
    operatingExpenses: CategoryTotal;
    operatingIncome: number;
    nonOperatingIncome: CategoryTotal;
    nonOperatingExpenses: CategoryTotal;
    incomeBeforeTaxes: number;
    taxProvision: number;
    netIncome: number;
}

export interface CategoryTotal {
    accounts: AccountTotal[];
    total: number;
}

export interface AccountTotal {
    accountCode: string;
    accountName: string;
    amount: number;
}

// Balance General Types
export interface BalanceSheetData {
    assets: {
        current: CategoryTotal;
        nonCurrent: CategoryTotal;
        total: number;
    };
    liabilities: {
        current: CategoryTotal;
        nonCurrent: CategoryTotal;
        total: number;
    };
    equity: {
        components: CategoryTotal;
        total: number;
    };
    isBalanced: boolean;
}
