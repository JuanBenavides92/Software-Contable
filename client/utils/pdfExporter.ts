import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportOptions, ExportResult } from '@/types/exports';

/**
 * Export data to PDF format
 */
export function exportToPDF(
    data: any[],
    title: string,
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

        // Create PDF document
        const doc = new jsPDF({
            orientation: 'landscape', // Most accounting reports are wide
            unit: 'mm',
            format: 'a4',
        });

        // Header - Company Info
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 20);

        if (options.companyInfo) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(options.companyInfo.businessName, 14, 28);
            doc.text(`NIT: ${options.companyInfo.nit}`, 14, 33);
            if (options.companyInfo.address) {
                doc.text(options.companyInfo.address, 14, 38);
            }
        }

        // Period info
        if (options.dateRange) {
            doc.setFontSize(10);
            const periodY = options.companyInfo ? 43 : 28;
            const startDate = options.dateRange.startDate.toLocaleDateString('es-CO');
            const endDate = options.dateRange.endDate.toLocaleDateString('es-CO');
            doc.text(`Período: ${startDate} - ${endDate}`, 14, periodY);
        }

        // Generation date
        doc.setFontSize(8);
        doc.setTextColor(128);
        const genDate = `Generado: ${new Date().toLocaleString('es-CO')}`;
        doc.text(genDate, doc.internal.pageSize.width - 14, 15, { align: 'right' });
        doc.setTextColor(0);

        // Prepare table data
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => row[header]));

        // Table
        const startY = options.companyInfo ? 50 : 35;
        autoTable(doc, {
            startY,
            head: [headers],
            body: rows,
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185], // Professional blue
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            columnStyles: {
                // Right-align numeric columns (you can customize this)
                ...headers.reduce((acc, header, index) => {
                    if (header.toLowerCase().includes('débito') ||
                        header.toLowerCase().includes('crédito') ||
                        header.toLowerCase().includes('saldo') ||
                        header.toLowerCase().includes('valor') ||
                        header.toLowerCase().includes('monto')) {
                        acc[index] = { halign: 'right' };
                    }
                    return acc;
                }, {} as any),
            },
            didDrawPage: (data) => {
                // Footer - Page number
                const pageCount = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(128);
                doc.text(
                    `Página ${data.pageNumber} de ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            },
        });

        // Generate file name
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = options.fileName || `${title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.pdf`;

        // Save PDF
        doc.save(fileName);

        return {
            success: true,
            fileName,
            recordCount: data.length,
        };
    } catch (error) {
        return {
            success: false,
            fileName: '',
            error: error instanceof Error ? error.message : 'Error al exportar a PDF',
        };
    }
}
