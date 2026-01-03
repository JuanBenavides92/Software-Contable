import type {
    CompanyInfo,
    AccountingParams,
    AccountingPeriod,
    DocumentNumbering,
    User,
    ChartOfAccount,
    TaxConfiguration,
    BackupConfig,
    InterfacePreferences,
    Settings,
} from '@/types/settings';

// Mock Company Information
export const MOCK_COMPANY_INFO: CompanyInfo = {
    legalName: 'CONTABLE SOLUTIONS S.A.S.',
    commercialName: 'Cont Solutions',
    nit: '900123456',
    verificationDigit: '7',
    organizationType: 'SAS',
    constitutionDate: new Date('2020-01-15'),

    address: 'Calle 100 # 19-18 Oficina 501',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca',
    country: 'Colombia',
    phone: '+57 (1) 6543210',
    email: 'info@contablesolutions.com',
    website: 'www.contablesolutions.com',

    taxRegime: 'COMUN',
    fiscalResponsibilities: ['IVA', 'RETENCION_FUENTE', 'ICA'],
    economicActivity: '6920',
    legalRepresentative: 'María González Pérez',

    primaryColor: '#3B82F6',
    reportFooter: 'Contable Solutions S.A.S. - NIT 900.123.456-7 - www.contablesolutions.com',
};

// Mock Accounting Parameters
export const MOCK_ACCOUNTING_PARAMS: AccountingParams = {
    currency: 'COP',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',

    costingMethod: 'AVERAGE',
    useCostCenters: true,
    requireThirdParties: true,
    allowEditPostedEntries: false,
    autoClosePeriods: false,

    defaultVATRate: 19,
    autoCalculateVAT: true,
    minimumRetentionBase: 1000000,
};

// Mock Accounting Periods
export const MOCK_PERIODS: AccountingPeriod[] = [
    {
        id: 'period-2025-01',
        year: 2025,
        month: 1,
        monthName: 'Enero',
        status: 'OPEN',
    },
    {
        id: 'period-2024-12',
        year: 2024,
        month: 12,
        monthName: 'Diciembre',
        status: 'CLOSED',
        closedAt: new Date('2025-01-05'),
        closedBy: 'María González',
    },
    {
        id: 'period-2024-11',
        year: 2024,
        month: 11,
        monthName: 'Noviembre',
        status: 'CLOSED',
        closedAt: new Date('2024-12-05'),
        closedBy: 'María González',
    },
];

// Mock Document Numbering
export const MOCK_NUMBERING: DocumentNumbering[] = [
    {
        id: 'num-1',
        documentType: 'JOURNAL_ENTRY',
        prefix: 'JE-',
        includeYear: true,
        currentNumber: 108,
        initialNumber: 1,
        padding: 4,
        resetYearly: true,
    },
    {
        id: 'num-2',
        documentType: 'INVOICE',
        prefix: 'FV-',
        includeYear: false,
        currentNumber: 450,
        initialNumber: 1,
        padding: 4,
        resetYearly: false,
    },
    {
        id: 'num-3',
        documentType: 'EXPENSE_VOUCHER',
        prefix: 'CE-',
        includeYear: false,
        currentNumber: 890,
        initialNumber: 1,
        padding: 4,
        resetYearly: false,
    },
    {
        id: 'num-4',
        documentType: 'INCOME_VOUCHER',
        prefix: 'CI-',
        includeYear: false,
        currentNumber: 234,
        initialNumber: 1,
        padding: 4,
        resetYearly: false,
    },
];

// Mock Users
export const MOCK_USERS: User[] = [
    {
        id: 'user-1',
        fullName: 'María González',
        email: 'maria.gonzalez@contablesolutions.com',
        username: 'mgonzalez',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date('2025-01-03T08:00:00'),
    },
    {
        id: 'user-2',
        fullName: 'Juan Pérez',
        email: 'juan.perez@contablesolutions.com',
        username: 'jperez',
        role: 'ACCOUNTANT',
        isActive: true,
        createdAt: new Date('2024-02-15'),
        lastLogin: new Date('2025-01-03T09:30:00'),
    },
    {
        id: 'user-3',
        fullName: 'Ana Rodríguez',
        email: 'ana.rodriguez@contablesolutions.com',
        username: 'arodriguez',
        role: 'ASSISTANT',
        isActive: true,
        createdAt: new Date('2024-03-20'),
        lastLogin: new Date('2025-01-02T14:20:00'),
    },
    {
        id: 'user-4',
        fullName: 'Carlos Díaz',
        email: 'carlos.diaz@contablesolutions.com',
        username: 'cdiaz',
        role: 'AUDITOR',
        isActive: false,
        createdAt: new Date('2024-05-10'),
        lastLogin: new Date('2024-12-20T16:45:00'),
    },
];

// Mock Chart of Accounts (subset)
export const MOCK_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
    {
        code: '1',
        name: 'ACTIVO',
        type: 'ASSET',
        nature: 'DEBIT',
        level: 1,
        requiresThirdParty: false,
        isMovement: false,
        usedForVAT: false,
        usedForRetention: false,
        isActive: true,
    },
    {
        code: '11',
        name: 'ACTIVO CORRIENTE',
        type: 'ASSET',
        nature: 'DEBIT',
        level: 2,
        parentCode: '1',
        requiresThirdParty: false,
        isMovement: false,
        usedForVAT: false,
        usedForRetention: false,
        isActive: true,
    },
    {
        code: '1105',
        name: 'CAJA',
        type: 'ASSET',
        nature: 'DEBIT',
        level: 3,
        parentCode: '11',
        requiresThirdParty: false,
        isMovement: true,
        usedForVAT: false,
        usedForRetention: false,
        isActive: true,
    },
    {
        code: '1110',
        name: 'BANCOS',
        type: 'ASSET',
        nature: 'DEBIT',
        level: 3,
        parentCode: '11',
        requiresThirdParty: true,
        isMovement: true,
        usedForVAT: false,
        usedForRetention: false,
        isActive: true,
    },
];

// Mock Tax Configuration
export const MOCK_TAX_CONFIG: TaxConfiguration = {
    vat: {
        generalRate: 19,
        reducedRate: 5,
        rates: [
            { rate: 0, description: 'Exento' },
            { rate: 5, description: 'Tarifa Reducida' },
            { rate: 19, description: 'Tarifa General' },
        ],
    },
    retentions: [
        {
            id: 'ret-1',
            concept: 'Servicios',
            rate: 4,
            minimumBase: 1000000,
            applicableFor: 'PURCHASES',
        },
        {
            id: 'ret-2',
            concept: 'Honorarios',
            rate: 11,
            minimumBase: 1000000,
            applicableFor: 'PURCHASES',
        },
        {
            id: 'ret-3',
            concept: 'Arrendamientos',
            rate: 3.5,
            minimumBase: 1000000,
            applicableFor: 'PURCHASES',
        },
    ],
    dian: {
        electronicInvoicing: true,
        softwareId: 'SOFTWARE-123456',
        pin: '12345',
        environment: 'TESTING',
        resolutionNumber: '18760000001',
        resolutionDate: new Date('2024-01-15'),
        authorizedPrefix: 'SETP',
        rangeFrom: 1,
        rangeTo: 5000,
        validUntil: new Date('2026-01-15'),
    },
};

// Mock Backup Configuration
export const MOCK_BACKUP_CONFIG: BackupConfig = {
    autoBackup: true,
    frequency: 'DAILY',
    time: '02:00',
    location: 'C:\\Backups\\Contable',
    retention: 30,
    includeAttachments: true,
    lastBackup: new Date('2025-01-03T02:00:00'),
};

// Mock Interface Preferences
export const MOCK_INTERFACE_PREFS: InterfacePreferences = {
    theme: 'LIGHT',
    fontSize: 'MEDIUM',
    language: 'es-CO',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    enableNotifications: true,
    enableSounds: false,
    notifyCriticalEvents: true,
    dailySummaryEmail: false,

    dashboardWidgets: ['recent-entries', 'period-summary', 'pending-tasks'],
    defaultReportPeriod: 'CURRENT_MONTH',
};

// Complete Mock Settings
export const MOCK_SETTINGS: Settings = {
    company: MOCK_COMPANY_INFO,
    accounting: MOCK_ACCOUNTING_PARAMS,
    periods: MOCK_PERIODS,
    numbering: MOCK_NUMBERING,
    users: MOCK_USERS,
    chartOfAccounts: MOCK_CHART_OF_ACCOUNTS,
    tax: MOCK_TAX_CONFIG,
    backup: MOCK_BACKUP_CONFIG,
    interface: MOCK_INTERFACE_PREFS,
};
