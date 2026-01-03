import type { JournalEntry } from "@/types/journalEntry";
import type {
    MayorAccount,
    MayorMovement,
    TrialBalanceAccount,
    TrialBalanceData,
} from "@/types/reports";

/**
 * Calculate initial balance for an account before a given date
 * For now, returns 0 as we don't have historical data
 */
export function calculateInitialBalance(
    accountId: string,
    startDate: Date,
    allEntries: JournalEntry[]
): number {
    // Filter entries before the start date
    const previousEntries = allEntries.filter(
        (entry) =>
            entry.date < startDate &&
            entry.status === "POSTED" &&
            entry.lines.some((line) => line.accountId === accountId)
    );

    let balance = 0;
    previousEntries.forEach((entry) => {
        entry.lines.forEach((line) => {
            if (line.accountId === accountId) {
                balance += line.debit - line.credit;
            }
        });
    });

    return balance;
}

/**
 * Get account movements within a date range
 */
export function getAccountMovements(
    accountId: string,
    startDate: Date,
    endDate: Date,
    allEntries: JournalEntry[]
): MayorMovement[] {
    const movements: MayorMovement[] = [];
    let runningBalance = calculateInitialBalance(accountId, startDate, allEntries);

    // Filter and sort entries in the date range
    const relevantEntries = allEntries
        .filter(
            (entry) =>
                entry.date >= startDate &&
                entry.date <= endDate &&
                entry.status === "POSTED" &&
                entry.lines.some((line) => line.accountId === accountId)
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    relevantEntries.forEach((entry) => {
        entry.lines.forEach((line) => {
            if (line.accountId === accountId) {
                runningBalance += line.debit - line.credit;
                movements.push({
                    date: entry.date,
                    entryNumber: entry.entryNumber,
                    concept: entry.concept,
                    debit: line.debit,
                    credit: line.credit,
                    balance: runningBalance,
                });
            }
        });
    });

    return movements;
}

/**
 * Generate Trial Balance (Balance de Comprobación)
 */
export function generateTrialBalance(
    startDate: Date,
    endDate: Date,
    allEntries: JournalEntry[],
    allAccounts: { id: string; code: string; name: string; type: string }[]
): TrialBalanceData {
    const accountsMap = new Map<string, TrialBalanceAccount>();

    // Initialize all accounts
    allAccounts.forEach((account) => {
        accountsMap.set(account.id, {
            accountCode: account.code,
            accountName: account.name,
            accountType: account.type,
            initialDebit: 0,
            initialCredit: 0,
            movementsDebit: 0,
            movementsCredit: 0,
            finalDebit: 0,
            finalCredit: 0,
        });
    });

    // Calculate initial balances (before start date)
    allAccounts.forEach((account) => {
        const initialBalance = calculateInitialBalance(
            account.id,
            startDate,
            allEntries
        );
        const accountData = accountsMap.get(account.id)!;
        if (initialBalance >= 0) {
            accountData.initialDebit = initialBalance;
        } else {
            accountData.initialCredit = Math.abs(initialBalance);
        }
    });

    // Calculate movements in the period
    const periodEntries = allEntries.filter(
        (entry) =>
            entry.date >= startDate &&
            entry.date <= endDate &&
            entry.status === "POSTED"
    );

    periodEntries.forEach((entry) => {
        entry.lines.forEach((line) => {
            const accountData = accountsMap.get(line.accountId);
            if (accountData) {
                accountData.movementsDebit += line.debit;
                accountData.movementsCredit += line.credit;
            }
        });
    });

    // Calculate final balances
    accountsMap.forEach((accountData) => {
        const finalBalance =
            accountData.initialDebit -
            accountData.initialCredit +
            accountData.movementsDebit -
            accountData.movementsCredit;

        if (finalBalance >= 0) {
            accountData.finalDebit = finalBalance;
            accountData.finalCredit = 0;
        } else {
            accountData.finalDebit = 0;
            accountData.finalCredit = Math.abs(finalBalance);
        }
    });

    // Filter accounts with movements
    const accounts = Array.from(accountsMap.values()).filter(
        (acc) =>
            acc.initialDebit > 0 ||
            acc.initialCredit > 0 ||
            acc.movementsDebit > 0 ||
            acc.movementsCredit > 0
    );

    // Calculate totals
    const totals = accounts.reduce(
        (acc, account) => ({
            initialDebit: acc.initialDebit + account.initialDebit,
            initialCredit: acc.initialCredit + account.initialCredit,
            movementsDebit: acc.movementsDebit + account.movementsDebit,
            movementsCredit: acc.movementsCredit + account.movementsCredit,
            finalDebit: acc.finalDebit + account.finalDebit,
            finalCredit: acc.finalCredit + account.finalCredit,
        }),
        {
            initialDebit: 0,
            initialCredit: 0,
            movementsDebit: 0,
            movementsCredit: 0,
            finalDebit: 0,
            finalCredit: 0,
        }
    );

    // Check if balanced (debits = credits with tolerance)
    const tolerance = 0.01;
    const isBalanced =
        Math.abs(totals.finalDebit - totals.finalCredit) <= tolerance;

    return {
        accounts,
        totals,
        isBalanced,
    };
}

/**
 * Format currency for Colombian pesos
 */
export function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Format date for reports
 */
export function formatReportDate(date: Date): string {
    return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
