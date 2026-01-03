import type { AuditEvent, AuditEventType, AuditFilters, AuditSeverity, AuditModule } from '@/types/audit';

/**
 * Generate unique ID
 */
function generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Audit Logger Singleton
 * Centralized service for logging all audit events
 */
class AuditLogger {
    private static instance: AuditLogger;
    private readonly STORAGE_KEY = 'audit_events';
    private readonly MAX_EVENTS = 1000;

    private constructor() { }

    static getInstance(): AuditLogger {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }

    /**
     * Log a generic audit event
     */
    async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
        const auditEvent: AuditEvent = {
            id: generateId(),
            timestamp: new Date(),
            ...event,
        };

        console.log('[AUDIT]', auditEvent);

        // Store locally
        const stored = this.getStoredEvents();
        stored.unshift(auditEvent);

        // Keep only MAX_EVENTS
        const trimmed = stored.slice(0, this.MAX_EVENTS);

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Failed to store audit event:', error);
        }
    }

    /**
     * Log journal entry creation
     */
    logJournalCreate(userId: string, userName: string, entryId: string, entryNumber: number, concept: string): void {
        this.log({
            eventType: 'JOURNAL_CREATE',
            severity: 'INFO',
            userId,
            userName,
            userRole: 'Contador',
            module: 'JOURNAL_ENTRIES',
            action: `Creó asiento contable JE-${entryNumber}`,
            entityType: 'JournalEntry',
            entityId: entryId,
            entityName: `JE-${entryNumber}`,
            notes: concept,
        });
    }

    /**
     * Log journal entry update
     */
    logJournalUpdate(userId: string, userName: string, entryId: string, entryNumber: number, changes: any): void {
        this.log({
            eventType: 'JOURNAL_UPDATE',
            severity: 'INFO',
            userId,
            userName,
            module: 'JOURNAL_ENTRIES',
            action: `Modificó asiento JE-${entryNumber}`,
            entityType: 'JournalEntry',
            entityId: entryId,
            entityName: `JE-${entryNumber}`,
            changes,
        });
    }

    /**
     * Log journal entry posting
     */
    logJournalPost(userId: string, userName: string, entryId: string, entryNumber: number): void {
        this.log({
            eventType: 'JOURNAL_POST',
            severity: 'WARNING',
            userId,
            userName,
            module: 'JOURNAL_ENTRIES',
            action: `Contabilizó asiento JE-${entryNumber}`,
            entityType: 'JournalEntry',
            entityId: entryId,
            entityName: `JE-${entryNumber}`,
            changes: [{
                field: 'status',
                fieldLabel: 'Estado',
                oldValue: 'DRAFT',
                newValue: 'POSTED',
                changeType: 'UPDATE',
            }],
        });
    }

    /**
     * Log journal entry reversal
     */
    logJournalReverse(
        userId: string,
        userName: string,
        originalEntryId: string,
        originalEntryNumber: number,
        reversalEntryId: string,
        reversalEntryNumber: number,
        reason?: string
    ): void {
        this.log({
            eventType: 'JOURNAL_REVERSE',
            severity: 'CRITICAL',
            userId,
            userName,
            module: 'JOURNAL_ENTRIES',
            action: `Reversó asiento JE-${originalEntryNumber}`,
            entityType: 'JournalEntry',
            entityId: originalEntryId,
            entityName: `JE-${originalEntryNumber}`,
            changes: [{
                field: 'status',
                fieldLabel: 'Estado',
                oldValue: 'POSTED',
                newValue: 'REVERSED',
                changeType: 'UPDATE',
            }],
            metadata: {
                reversalEntryId,
                reversalEntryNumber,
            },
            notes: reason,
        });
    }

    /**
     * Log user login
     */
    logUserLogin(userId: string, userName: string, ipAddress?: string): void {
        this.log({
            eventType: 'USER_LOGIN',
            severity: 'INFO',
            userId,
            userName,
            module: 'USER_MANAGEMENT',
            action: 'Ingresó al sistema',
            ipAddress,
            userAgent: navigator.userAgent,
        });
    }

    /**
     * Log user logout
     */
    logUserLogout(userId: string, userName: string): void {
        this.log({
            eventType: 'USER_LOGOUT',
            severity: 'INFO',
            userId,
            userName,
            module: 'USER_MANAGEMENT',
            action: 'Cerró sesión',
        });
    }

    /**
     * Log report generation
     */
    logReportGenerate(userId: string, userName: string, reportName: string, params?: any): void {
        this.log({
            eventType: 'REPORT_GENERATE',
            severity: 'INFO',
            userId,
            userName,
            module: 'REPORTS',
            action: `Generó reporte: ${reportName}`,
            entityType: 'Report',
            entityName: reportName,
            metadata: params,
        });
    }

    /**
     * Log data export
     */
    logDataExport(userId: string, userName: string, exportType: string, format: string, recordCount?: number): void {
        this.log({
            eventType: 'EXPORT_DATA',
            severity: 'WARNING',
            userId,
            userName,
            module: 'EXPORTS',
            action: `Exportó ${exportType} a ${format}`,
            entityType: 'Export',
            entityName: `${exportType} (${format})`,
            metadata: {
                format,
                recordCount,
            },
        });
    }

    /**
     * Log reconciliation completion
     */
    logReconciliationComplete(
        userId: string,
        userName: string,
        reconciliationId: string,
        bankAccount: string,
        period: string
    ): void {
        this.log({
            eventType: 'RECONCILIATION_COMPLETE',
            severity: 'WARNING',
            userId,
            userName,
            module: 'RECONCILIATION',
            action: `Completó conciliación bancaria`,
            entityType: 'Reconciliation',
            entityId: reconciliationId,
            entityName: `${bankAccount} - ${period}`,
        });
    }

    /**
     * Get stored events from localStorage
     */
    private getStoredEvents(): AuditEvent[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];

            const events = JSON.parse(stored);
            // Parse dates
            return events.map((e: any) => ({
                ...e,
                timestamp: new Date(e.timestamp),
            }));
        } catch (error) {
            console.error('Failed to load audit events:', error);
            return [];
        }
    }

    /**
     * Query events with filters
     */
    queryEvents(filters: AuditFilters = {}): AuditEvent[] {
        const events = this.getStoredEvents();

        return events.filter(event => {
            // Date range
            if (filters.dateRange) {
                const eventDate = new Date(event.timestamp);
                if (eventDate < filters.dateRange.startDate || eventDate > filters.dateRange.endDate) {
                    return false;
                }
            }

            // User IDs
            if (filters.userIds && filters.userIds.length > 0) {
                if (!filters.userIds.includes(event.userId)) {
                    return false;
                }
            }

            // Event types
            if (filters.eventTypes && filters.eventTypes.length > 0) {
                if (!filters.eventTypes.includes(event.eventType)) {
                    return false;
                }
            }

            // Modules
            if (filters.modules && filters.modules.length > 0) {
                if (!filters.modules.includes(event.module)) {
                    return false;
                }
            }

            // Severity
            if (filters.severity && filters.severity.length > 0) {
                if (!filters.severity.includes(event.severity)) {
                    return false;
                }
            }

            // Search term
            if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                const searchableText = `
          ${event.userName}
          ${event.action}
          ${event.entityName || ''}
          ${event.notes || ''}
        `.toLowerCase();

                if (!searchableText.includes(term)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Get events count by type
     */
    getEventsByType(): Record<string, number> {
        const events = this.getStoredEvents();
        const counts: Record<string, number> = {};

        events.forEach(event => {
            counts[event.eventType] = (counts[event.eventType] || 0) + 1;
        });

        return counts;
    }

    /**
     * Get events count by user
     */
    getEventsByUser(): Record<string, number> {
        const events = this.getStoredEvents();
        const counts: Record<string, number> = {};

        events.forEach(event => {
            const key = `${event.userName} (${event.userId})`;
            counts[key] = (counts[key] || 0) + 1;
        });

        return counts;
    }

    /**
     * Get critical events count
     */
    getCriticalEventsCount(): number {
        const events = this.getStoredEvents();
        return events.filter(e => e.severity === 'CRITICAL').length;
    }

    /**
     * Clear all events (admin only, use with caution)
     */
    clearAll(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

export const auditLogger = AuditLogger.getInstance();
