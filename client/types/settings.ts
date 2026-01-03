// Settings and Configuration Types

// ============ Company Information ============
export type OrganizationType =
    | 'SAS'
    | 'LTDA'
    | 'SA'
    | 'PERSONA_NATURAL'
    | 'ONG'
    | 'OTRO';

export type TaxRegime =
    | 'COMUN'
    | 'SIMPLIFICADO'
    | 'NO_RESPONSABLE'
    | 'GRAN_CONTRIBUYENTE';

export type FiscalResponsibility =
    | 'IVA'
    | 'RETENCION_FUENTE'
    | 'RETENCION_IVA'
    | 'ICA'
    | 'GRAN_CONTRIBUYENTE'
    | 'AUTORETENEDOR';

export interface CompanyInfo {
    // Basic
    legalName: string;
    commercialName?: string;
    nit: string;
    verificationDigit: string;
    organizationType: OrganizationType;
    constitutionDate: Date;

    // Location
    address: string;
    city: string;
    department: string;
    country: string;
    phone: string;
    email: string;
    website?: string;

    // Tax
    taxRegime: TaxRegime;
    fiscalResponsibilities: FiscalResponsibility[];
    economicActivity: string; // CIIU
    legalRepresentative: string;

    // Branding
    logo?: string; // Base64 or URL
    primaryColor?: string;
    reportFooter?: string;
}

// ============ Accounting Parameters ============
export interface AccountingParams {
    currency: string; // 'COP'
    decimals: number; // 2
    thousandsSeparator: ',' | '.';
    decimalSeparator: ',' | '.';

    costingMethod: 'FIFO' | 'LIFO' | 'AVERAGE';
    useCostCenters: boolean;
    requireThirdParties: boolean;
    allowEditPostedEntries: boolean;
    autoClosePeriods: boolean;

    defaultVATRate: number; // 19
    autoCalculateVAT: boolean;
    minimumRetentionBase: number;
}

// ============ Accounting Periods ============
export interface AccountingPeriod {
    id: string;
    year: number;
    month: number;
    monthName: string;
    status: 'OPEN' | 'CLOSED';
    closedAt?: Date;
    closedBy?: string;
}

// ============ Document Numbering ============
export type DocumentType =
    | 'JOURNAL_ENTRY'
    | 'INVOICE'
    | 'EXPENSE_VOUCHER'
    | 'INCOME_VOUCHER'
    | 'CASH_RECEIPT'
    | 'DEBIT_NOTE'
    | 'CREDIT_NOTE';

export interface DocumentNumbering {
    id: string;
    documentType: DocumentType;
    prefix: string;
    includeYear: boolean;
    currentNumber: number;
    initialNumber: number;
    padding: number; // Zeros
    resetYearly: boolean;
}

// ============ User Management ============
export type UserRole =
    | 'ADMIN'
    | 'ACCOUNTANT'
    | 'ASSISTANT'
    | 'AUDITOR';

export interface Permission {
    module: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: UserRole;
    permissions?: Permission[];
    isActive: boolean;
    createdAt: Date;
    lastLogin?: Date;
}

// ============ Chart of Accounts ============
export type AccountType =
    | 'ASSET'
    | 'LIABILITY'
    | 'EQUITY'
    | 'INCOME'
    | 'EXPENSE';

export interface ChartOfAccount {
    code: string;
    name: string;
    type: AccountType;
    nature: 'DEBIT' | 'CREDIT';
    level: number;
    parentCode?: string;
    requiresThirdParty: boolean;
    isMovement: boolean; // vs Accumulation
    usedForVAT: boolean;
    usedForRetention: boolean;
    isActive: boolean;
}

// ============ Tax Configuration ============
export interface VATConfig {
    generalRate: number;
    reducedRate: number;
    rates: VATRate[];
}

export interface VATRate {
    rate: number;
    description: string;
}

export interface RetentionConfig {
    id: string;
    concept: string;
    rate: number;
    minimumBase: number;
    applicableFor: 'PURCHASES' | 'SALES' | 'BOTH';
}

export interface DIANConfig {
    electronicInvoicing: boolean;
    softwareId?: string;
    pin?: string;
    environment: 'TESTING' | 'PRODUCTION';
    certificate?: string; // Base64
    certificatePassword?: string;
    certificateExpiry?: Date;
    technicalKey?: string;

    // Resolution
    resolutionNumber?: string;
    resolutionDate?: Date;
    authorizedPrefix?: string;
    rangeFrom?: number;
    rangeTo?: number;
    validUntil?: Date;
}

export interface TaxConfiguration {
    vat: VATConfig;
    retentions: RetentionConfig[];
    dian: DIANConfig;
}

// ============ Backup Configuration ============
export interface BackupConfig {
    autoBackup: boolean;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    time: string; // HH:mm
    location: string;
    retention: number; // Days
    includeAttachments: boolean;
    lastBackup?: Date;
}

export interface BackupHistory {
    id: string;
    filename: string;
    size: number;
    createdAt: Date;
    createdBy: string;
}

// ============ Interface Preferences ============
export interface InterfacePreferences {
    theme: 'LIGHT' | 'DARK' | 'AUTO';
    fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
    language: string;
    dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
    timeFormat: '12h' | '24h';

    enableNotifications: boolean;
    enableSounds: boolean;
    notifyCriticalEvents: boolean;
    dailySummaryEmail: boolean;

    dashboardWidgets: string[];
    defaultReportPeriod: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'CUSTOM';
}

// ============ Main Settings ============
export interface Settings {
    company: CompanyInfo;
    accounting: AccountingParams;
    periods: AccountingPeriod[];
    numbering: DocumentNumbering[];
    users: User[];
    chartOfAccounts: ChartOfAccount[];
    tax: TaxConfiguration;
    backup: BackupConfig;
    interface: InterfacePreferences;
}

// ============ Labels ============
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
    SAS: 'Sociedad por Acciones Simplificada (S.A.S.)',
    LTDA: 'Sociedad Limitada (Ltda.)',
    SA: 'Sociedad Anónima (S.A.)',
    PERSONA_NATURAL: 'Persona Natural',
    ONG: 'Organización No Gubernamental',
    OTRO: 'Otro',
};

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
    COMUN: 'Régimen Común',
    SIMPLIFICADO: 'Régimen Simplificado',
    NO_RESPONSABLE: 'No Responsable de IVA',
    GRAN_CONTRIBUYENTE: 'Gran Contribuyente',
};

export const FISCAL_RESPONSIBILITY_LABELS: Record<FiscalResponsibility, string> = {
    IVA: 'Responsable de IVA',
    RETENCION_FUENTE: 'Agente de Retención en la Fuente',
    RETENCION_IVA: 'Agente de Retención de IVA',
    ICA: 'Responsable de ICA',
    GRAN_CONTRIBUYENTE: 'Gran Contribuyente',
    AUTORETENEDOR: 'Autoretenedor',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    JOURNAL_ENTRY: 'Asiento Contable',
    INVOICE: 'Factura de Venta',
    EXPENSE_VOUCHER: 'Comprobante de Egreso',
    INCOME_VOUCHER: 'Comprobante de Ingreso',
    CASH_RECEIPT: 'Recibo de Caja',
    DEBIT_NOTE: 'Nota Débito',
    CREDIT_NOTE: 'Nota Crédito',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    ACCOUNTANT: 'Contador',
    ASSISTANT: 'Asistente Contable',
    AUDITOR: 'Auditor',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    ASSET: 'Activo',
    LIABILITY: 'Pasivo',
    EQUITY: 'Patrimonio',
    INCOME: 'Ingreso',
    EXPENSE: 'Egreso',
};
