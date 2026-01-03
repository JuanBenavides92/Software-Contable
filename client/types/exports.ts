// Types for Exports Module

export type ExportFormat = 'EXCEL' | 'CSV' | 'PDF' | 'XML';

export type ExportableModule =
    | 'JOURNAL_ENTRIES'
    | 'CHART_OF_ACCOUNTS'
    | 'REPORTS_DIARIO'
    | 'REPORTS_BALANCE'
    | 'REPORTS_MAYOR'
    | 'CERTIFICATES'
    | 'DIAN_MEDIOS_MAGNETICOS';

export const EXPORT_MODULE_LABELS: Record<ExportableModule, string> = {
    JOURNAL_ENTRIES: 'Asientos Contables',
    CHART_OF_ACCOUNTS: 'Plan de Cuentas',
    REPORTS_DIARIO: 'Libro Diario',
    REPORTS_BALANCE: 'Balance de Comprobación',
    REPORTS_MAYOR: 'Libro Mayor',
    CERTIFICATES: 'Certificados Tributarios',
    DIAN_MEDIOS_MAGNETICOS: 'Medios Magnéticos DIAN',
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
    EXCEL: 'Excel (.xlsx)',
    CSV: 'CSV (.csv)',
    PDF: 'PDF (.pdf)',
    XML: 'XML (.xml)',
};

export interface ExportOptions {
    format: ExportFormat;
    module: ExportableModule;

    // Filters
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };

    // Specific filters by module
    journalEntryFilters?: {
        status?: ('DRAFT' | 'POSTED' | 'REVERSED')[];
        type?: string[];
    };

    reportFilters?: {
        accountId?: string; // For Libro Mayor
        fiscalYear?: number;
    };

    // Export settings
    includeHeaders?: boolean;
    includeMetadata?: boolean;
    includeDetails?: boolean; // Include line details for journal entries
    fileName?: string;

    // Company info (for headers in exports)
    companyInfo?: {
        nit: string;
        businessName: string;
        address?: string;
    };
}

export interface ExportResult {
    success: boolean;
    fileName: string;
    downloadUrl?: string;
    error?: string;
    recordCount?: number;
}

export interface ExportCard {
    id: ExportableModule;
    title: string;
    description: string;
    icon: string;
    formats: ExportFormat[];
    enabled: boolean;
}
