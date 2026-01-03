/**
 * Accounting utilities and calculations
 */

export interface AccountingEntry {
  debit: number;
  credit: number;
}

/**
 * Validates that debits equal credits in an accounting entry
 */
export function isBalanced(entries: AccountingEntry[]): boolean {
  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for floating point errors
}

/**
 * Calculate account balance based on entries
 */
export function calculateBalance(
  entries: Array<{ debit: number; credit: number }>,
  accountType: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
): number {
  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

  // For Assets and Expenses: debit is positive, credit is negative
  // For Liabilities, Equity, and Revenue: credit is positive, debit is negative
  if (accountType === "ASSET" || accountType === "EXPENSE") {
    return totalDebits - totalCredits;
  }
  return totalCredits - totalDebits;
}

/**
 * Format currency with Colombian locale
 */
export function formatCurrency(
  value: number,
  currency: string = "COP",
  minimumFractionDigits: number = 0
): string {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2,
  });
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate the percentage change between two values
 */
export function calculatePercentageChange(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Get the trend direction (up or down)
 */
export function getTrendDirection(change: number): "up" | "down" {
  return change >= 0 ? "up" : "down";
}

/**
 * Calculate the accounting equation: Assets = Liabilities + Equity
 */
export function validateAccountingEquation(
  assets: number,
  liabilities: number,
  equity: number
): boolean {
  return Math.abs(assets - (liabilities + equity)) < 0.01;
}

/**
 * Group accounts by type
 */
export function groupAccountsByType(
  accounts: Array<{ type: string; [key: string]: any }>
): Record<string, typeof accounts> {
  return accounts.reduce(
    (acc, account) => {
      const type = account.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    },
    {} as Record<string, typeof accounts>
  );
}

/**
 * Calculate totals by account type
 */
export function calculateTypeTotal(
  accounts: Array<{ balance: number; [key: string]: any }>
): number {
  return accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
}

/**
 * Format account code with proper structure (e.g., "1.1.2.1")
 */
export function formatAccountCode(code: string): string {
  // Remove any non-numeric characters except dots
  const cleanCode = code.replace(/[^0-9.]/g, "");
  // Ensure it starts with 1-5 (for ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
  if (/^[1-5]/.test(cleanCode)) {
    return cleanCode;
  }
  return code;
}

/**
 * Validate account code format
 */
export function isValidAccountCode(code: string): boolean {
  return /^[1-5]\d{3,4}(\.\d+)*$/.test(code);
}

/**
 * Get account type from code (Colombian PUC standard)
 */
export function getAccountTypeFromCode(
  code: string
): "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE" {
  const firstDigit = code[0];
  const typeMap: Record<
    string,
    "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
  > = {
    "1": "ASSET",
    "2": "LIABILITY",
    "3": "EQUITY",
    "4": "REVENUE",
    "5": "EXPENSE",
  };
  return typeMap[firstDigit] || "ASSET";
}
