import type { BankMovement } from '@/types/reconciliation';

/**
 * Parse CSV bank statement
 * Expected format: Fecha,Tipo,Concepto,Referencia,Débito,Crédito,Saldo
 */
export function parseCSVBankStatement(csvContent: string): BankMovement[] {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no tiene datos');
    }

    const headers = lines[0].split(',').map(h => h.trim());

    // Validate required columns
    const requiredColumns = ['Fecha', 'Concepto'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        throw new Error(`Columnas requeridas faltantes: ${missingColumns.join(', ')}`);
    }

    const movements: BankMovement[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const values = line.split(',').map(v => v.trim());
        if (values.length < headers.length) continue; // Skip incomplete rows

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        try {
            // Parse amounts
            const debit = parseFloat(row['Débito'] || row['Debito'] || '0');
            const credit = parseFloat(row['Crédito'] || row['Credito'] || '0');

            // Determine type and amount
            const isCredit = credit > 0;
            const amount = isCredit ? credit : debit;

            if (amount === 0) continue; // Skip zero amount rows

            // Parse date
            const dateStr = row['Fecha'];
            const date = parseDateString(dateStr);

            movements.push({
                id: `bank-import-${i}`,
                date,
                type: isCredit ? 'CREDIT' : 'DEBIT',
                amount,
                concept: row['Concepto'] || row['Descripcion'] || row['Descripción'] || 'Sin concepto',
                reference: row['Referencia'] || row['Ref'] || '',
                balance: parseFloat(row['Saldo'] || '0') || undefined,
                status: 'PENDING',
            });
        } catch (error) {
            console.warn(`Error parsing row ${i + 1}:`, error);
            // Continue with next row
        }
    }

    if (movements.length === 0) {
        throw new Error('No se pudieron importar movimientos del archivo CSV');
    }

    return movements;
}

/**
 * Parse date string in various formats
 */
function parseDateString(dateStr: string): Date {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
    }

    // Try DD/MM/YYYY
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Try MM/DD/YYYY (less common in Colombia but possible)
    const mmddyyyy = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (mmddyyyy) {
        const [, month, day, year] = mmddyyyy;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback: try native parser
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
        throw new Error(`Formato de fecha no reconocido: ${dateStr}`);
    }

    return parsedDate;
}

/**
 * Generate CSV template for bank statement
 */
export function generateCSVTemplate(): string {
    const headers = 'Fecha,Tipo,Concepto,Referencia,Débito,Crédito,Saldo';
    const example1 = '2025-01-03,CREDITO,Depósito cliente ABC,DEP-001,,1200000.00,6450000.00';
    const example2 = '2025-01-05,DEBITO,Cheque 1234,CH-1234,500000.00,,5950000.00';
    const example3 = '2025-01-12,DEBITO,Comisión administración,COM-012,15000.00,,5935000.00';

    return `${headers}\n${example1}\n${example2}\n${example3}`;
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(): void {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_extracto_bancario.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}
