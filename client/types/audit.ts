// Audit Trail Types

export type AuditEventType =
    // Journal Entries
    | 'JOURNAL_CREATE'
    | 'JOURNAL_UPDATE'
    | 'JOURNAL_POST'
    | 'JOURNAL_REVERSE'
    | 'JOURNAL_DELETE'
    // User & Access
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'USER_PASSWORD_CHANGE'
    | 'USER_PERMISSIONS_CHANGE'
    // Reports
    | 'REPORT_GENERATE'
    | 'EXPORT_DATA'
    // Reconciliation
    | 'RECONCILIATION_CREATE'
    | 'RECONCILIATION_COMPLETE'
    | 'RECONCILIATION_APPROVE'
    // Configuration
    | 'ACCOUNT_CREATE'
    | 'ACCOUNT_UPDATE'
    | 'PERIOD_OPEN'
    | 'PERIOD_CLOSE'
    | 'CONFIG_CHANGE';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AuditModule =
    | 'JOURNAL_ENTRIES'
    | 'REPORTS'
    | 'RECONCILIATION'
    | 'CERTIFICATES'
    | 'EXPORTS'
    | 'CONFIGURATION'
    | 'USER_MANAGEMENT';

export interface AuditEvent {
    id: string;
    timestamp: Date;
    eventType: AuditEventType;
    severity: AuditSeverity;

    // Who
    userId: string;
    userName: string;
    userRole?: string;

    // What
    module: AuditModule;
    action: string;  // Human-readable action

    // Which entity
    entityType?: string;  // 'JournalEntry', 'Account', etc.
    entityId?: string;
    entityName?: string;

    // Changes (if applicable)
    changes?: AuditChange[];

    // Context
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;

    // Additional data
    metadata?: Record<string, any>;
    notes?: string;
}

export interface AuditChange {
    field: string;
    fieldLabel: string;
    oldValue: any;
    newValue: any;
    changeType: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface AuditFilters {
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    userIds?: string[];
    eventTypes?: AuditEventType[];
    modules?: AuditModule[];
    severity?: AuditSeverity[];
    searchTerm?: string;
}

export interface AuditReport {
    id: string;
    title: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByUser: Record<string, number>;
    criticalEvents: number;
    generatedAt: Date;
    generatedBy: string;
}

// Labels
export const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
    // Journal Entries
    JOURNAL_CREATE: 'Asiento Creado',
    JOURNAL_UPDATE: 'Asiento Modificado',
    JOURNAL_POST: 'Asiento Contabilizado',
    JOURNAL_REVERSE: 'Asiento Reversado',
    JOURNAL_DELETE: 'Asiento Eliminado',

    // User & Access  
    USER_LOGIN: 'Inicio de Sesión',
    USER_LOGOUT: 'Cierre de Sesión',
    USER_PASSWORD_CHANGE: 'Cambio de Contraseña',
    USER_PERMISSIONS_CHANGE: 'Cambio de Permisos',

    // Reports
    REPORT_GENERATE: 'Reporte Generado',
    EXPORT_DATA: 'Datos Exportados',

    // Reconciliation
    RECONCILIATION_CREATE: 'Conciliación Iniciada',
    RECONCILIATION_COMPLETE: 'Conciliación Completada',
    RECONCILIATION_APPROVE: 'Conciliación Aprobada',

    // Configuration
    ACCOUNT_CREATE: 'Cuenta Creada',
    ACCOUNT_UPDATE: 'Cuenta Modificada',
    PERIOD_OPEN: 'Período Abierto',
    PERIOD_CLOSE: 'Período Cerrado',
    CONFIG_CHANGE: 'Configuración Modificada',
};

export const AUDIT_SEVERITY_LABELS: Record<AuditSeverity, string> = {
    INFO: 'Información',
    WARNING: 'Advertencia',
    CRITICAL: 'Crítico',
};

export const AUDIT_MODULE_LABELS: Record<AuditModule, string> = {
    JOURNAL_ENTRIES: 'Asientos Contables',
    REPORTS: 'Reportes',
    RECONCILIATION: 'Conciliación Bancaria',
    CERTIFICATES: 'Certificados Tributarios',
    EXPORTS: 'Exportaciones',
    CONFIGURATION: 'Configuración',
    USER_MANAGEMENT: 'Usuarios',
};
