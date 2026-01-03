import * as XLSX from 'xlsx';
import type { ExportOptions, ExportResult } from '@/types/exports';

/**
 * Export data to Excel format (.xlsx)
 */
export function exportToExcel(
    data: any[],
    sheetName: string,
    options: ExportOptions
): ExportResult {
    try {
        if (!data || data.length === 0) {
            return {
                success: false,
                fileName: '',
                error: 'No hay datos para exportar',
            };
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths (auto-size)
        const maxWidth = 50;
        const colWidths = Object.keys(data[0]).map(key => {
            const maxLength = Math.max(
                key.length,
                ...data.map(row => String(row[key] || '').length)
            );
            return { wch: Math.min(maxLength + 2, maxWidth) };
        });
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Generate file name
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = options.fileName || `${sheetName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.xlsx`;

        // Write file
        XLSX.writeFile(wb, fileName);

        return {
            success: true,
            fileName,
            recordCount: data.length,
        };
    } catch (error) {
        return {
            success: false,
            fileName: '',
            error: error instanceof Error ? error.message : 'Error al exportar a Excel',
        };
    }
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
    data: any[],
    options: ExportOptions
): ExportResult {
    try {
        if (!data || data.length === 0) {
            return {
                success: false,
                fileName: '',
                error: 'No hay datos para exportar',
            };
        }

        // Get headers
        const headers = Object.keys(data[0]);

        // Build CSV content
        const csvRows = [
            // Header row
            headers.join(','),
            // Data rows
            ...data.map(row =>
                headers
                    .map(header => {
                        const value = row[header];
                        // Handle null/undefined
                        if (value === null || value === undefined) return '';
                        // Convert to string
                        const stringValue = String(value);
                        // Escape quotes and wrap in quotes if contains comma or quote
                        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                            return `"${stringValue.replace(/"/g, '""')}"`;
                        }
                        return stringValue;
                    })
                    .join(',')
            ),
        ];

        const csvContent = csvRows.join('\n');

        // Create blob with UTF-8 BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Generate file name
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = options.fileName || `export_${timestamp}.csv`;

        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        // Cleanup
        URL.revokeObjectURL(link.href);

        return {
            success: true,
            fileName,
            recordCount: data.length,
        };
    } catch (error) {
        return {
            success: false,
            fileName: '',
            error: error instanceof Error ? error.message : 'Error al exportar a CSV',
        };
    }
}

/**
 * Format currency for exports
 */
export function formatCurrencyForExport(amount: number): string {
    return amount.toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Format date for exports
 */
export function formatDateForExport(date: Date): string {
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}
