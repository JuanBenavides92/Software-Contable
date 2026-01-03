import type { JournalEntry } from '@/types/journalEntry';
import type { ExportOptions, ExportResult } from '@/types/exports';
import { exportToExcel, exportToCSV, formatCurrencyForExport, formatDateForExport } from './excelExporter';
import { exportToPDF } from './pdfExporter';

/**
 * Export journal entries to the specified format
 */
export function exportJournalEntries(
    entries: JournalEntry[],
    options: ExportOptions
): ExportResult {
    // Filter entries by date range
    const filteredEntries = entries.filter((entry) => {
        if (!options.dateRange) return true;

        const entryDate = new Date(entry.date);
        return (
            entryDate >= options.dateRange.startDate &&
            entryDate <= options.dateRange.endDate
        );
    });

    // Filter by status
    const finalEntries = filteredEntries.filter((entry) => {
        if (!options.journalEntryFilters?.status) return true;
        return options.journalEntryFilters.status.includes(entry.status);
    });

    if (finalEntries.length === 0) {
        return {
            success: false,
            fileName: '',
            error: 'No hay asientos contables para exportar con los filtros seleccionados',
        };
    }

    // Prepare data based on includeDetails option
    const data = options.includeDetails
        ? prepareDetailedData(finalEntries, options.includeMetadata || false)
        : prepareSummaryData(finalEntries, options.includeMetadata || false);

    // Export based on format
    switch (options.format) {
        case 'EXCEL':
            return exportToExcel(data, 'Asientos Contables', options);

        case 'CSV':
            return exportToCSV(data, options);

        case 'PDF':
            return exportToPDF(data, 'Asientos Contables', options);

        default:
            return {
                success: false,
                fileName: '',
                error: 'Formato de exportación no soportado',
            };
    }
}

/**
 * Prepare detailed data with all lines
 */
function prepareDetailedData(entries: JournalEntry[], includeMetadata: boolean) {
    const rows: any[] = [];

    entries.forEach((entry) => {
        const baseRow = {
            'Número': entry.entryNumber,
            'Fecha': formatDateForExport(entry.date),
            'Tipo': entry.entryType,
            'Concepto': entry.concept,
            'Estado': entry.status,
        };

        // Add lines
        entry.lines.forEach((line, index) => {
            const lineRow = {
                ...baseRow,
                'Línea': index + 1,
                'Código Cuenta': line.accountCode,
                'Nombre Cuenta': line.accountName,
                'Débito': line.debit > 0 ? formatCurrencyForExport(line.debit) : '',
                'Crédito': line.credit > 0 ? formatCurrencyForExport(line.credit) : '',
                'Descripción': line.description || '',
            };

            if (includeMetadata) {
                Object.assign(lineRow, {
                    'Creado Por': entry.createdBy,
                    'Fecha Creación': formatDateForExport(entry.createdAt),
                });
            }

            rows.push(lineRow);
        });

        // Add totals row
        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

        rows.push({
            ...baseRow,
            'Línea': 'TOTAL',
            'Código Cuenta': '',
            'Nombre Cuenta': '',
            'Débito': formatCurrencyForExport(totalDebit),
            'Crédito': formatCurrencyForExport(totalCredit),
            'Descripción': '',
            ...(includeMetadata ? {
                'Creado Por': '',
                'Fecha Creación': '',
            } : {}),
        });

        // Add empty row for separation
        rows.push({});
    });

    return rows.filter(row => Object.keys(row).length > 0); // Remove empty rows at end
}

/**
 * Prepare summary data (one row per entry)
 */
function prepareSummaryData(entries: JournalEntry[], includeMetadata: boolean) {
    return entries.map((entry) => {
        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

        const row: any = {
            'Número': entry.entryNumber,
            'Fecha': formatDateForExport(entry.date),
            'Tipo': entry.entryType,
            'Concepto': entry.concept,
            'Estado': entry.status,
            'Líneas': entry.lines.length,
            'Total Débito': formatCurrencyForExport(totalDebit),
            'Total Crédito': formatCurrencyForExport(totalCredit),
        };

        if (includeMetadata) {
            row['Creado Por'] = entry.createdBy;
            row['Fecha Creación'] = formatDateForExport(entry.createdAt);
            if (entry.postedBy) {
                row['Contabilizado Por'] = entry.postedBy;
                row['Fecha Contabilización'] = entry.postedAt ? formatDateForExport(entry.postedAt) : '';
            }
        }

        return row;
    });
}
