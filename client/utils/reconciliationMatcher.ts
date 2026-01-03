import type {
    AccountingMovement,
    BankMovement,
    MatchedMovement,
} from '@/types/reconciliation';

interface MatchCriteria {
    dateToleranceDays: number;     // ±2 days typical
    amountTolerancePct: number;    // ±0.5% for rounding
    minConfidence: number;         // 70% minimum
}

const DEFAULT_MATCH_CRITERIA: MatchCriteria = {
    dateToleranceDays: 2,
    amountTolerancePct: 0.005, // 0.5%
    minConfidence: 70,
};

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Automatic matching algorithm
 */
export function autoMatchMovements(
    accountingMovements: AccountingMovement[],
    bankMovements: BankMovement[],
    criteria: MatchCriteria = DEFAULT_MATCH_CRITERIA
): MatchedMovement[] {
    const matches: MatchedMovement[] = [];
    const usedBankIds = new Set<string>();
    const usedAccountingIds = new Set<string>();

    // Only match pending movements
    const pendingAccounting = accountingMovements.filter(m => m.status === 'PENDING');
    const pendingBank = bankMovements.filter(m => m.status === 'PENDING');

    for (const accMov of pendingAccounting) {
        if (usedAccountingIds.has(accMov.id)) continue;

        let bestMatch: { bankMov: BankMovement; confidence: number } | null = null;

        for (const bankMov of pendingBank) {
            if (usedBankIds.has(bankMov.id)) continue;

            // Calculate confidence score
            let confidence = 0;

            // 1. Amount match (40 points)
            const amountDiff = Math.abs(accMov.amount - bankMov.amount);
            if (amountDiff < 0.01) {
                confidence += 40;
            } else {
                const tolerance = accMov.amount * criteria.amountTolerancePct;
                if (amountDiff <= tolerance) {
                    confidence += 20;
                }
            }

            // 2. Date match (30 points)
            const daysDiff = Math.abs(
                (accMov.date.getTime() - bankMov.date.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff === 0) {
                confidence += 30;
            } else if (daysDiff <= criteria.dateToleranceDays) {
                confidence += Math.max(0, 30 - (daysDiff * 10)); // Decay by 10 points per day
            }

            // 3. Type match (15 points)
            if (accMov.type === bankMov.type) {
                confidence += 15;
            }

            // 4. Concept similarity (15 points)
            const conceptSimilarity = calculateStringSimilarity(
                accMov.concept.toLowerCase().trim(),
                bankMov.concept.toLowerCase().trim()
            );
            confidence += conceptSimilarity * 15;

            // Update best match
            if (confidence >= criteria.minConfidence && (!bestMatch || confidence > bestMatch.confidence)) {
                bestMatch = { bankMov, confidence };
            }
        }

        // Create match if found
        if (bestMatch) {
            matches.push({
                id: generateId(),
                accountingMovement: { ...accMov, status: 'MATCHED' },
                bankMovement: { ...bestMatch.bankMov, status: 'MATCHED' },
                matchType: 'AUTOMATIC',
                matchConfidence: Math.round(bestMatch.confidence),
                matchedAt: new Date(),
                matchedBy: 'SYSTEM',
            });
            usedBankIds.add(bestMatch.bankMov.id);
            usedAccountingIds.add(accMov.id);
        }
    }

    return matches;
}

/**
 * Create manual match
 */
export function createManualMatch(
    accountingMovement: AccountingMovement,
    bankMovement: BankMovement
): MatchedMovement {
    // Calculate basic confidence based on amount similarity
    const amountMatch = Math.abs(accountingMovement.amount - bankMovement.amount) < 0.01 ? 40 : 0;
    const typeMatch = accountingMovement.type === bankMovement.type ? 15 : 0;
    const confidence = amountMatch + typeMatch + 45; // Base 45 for manual review

    return {
        id: generateId(),
        accountingMovement: { ...accountingMovement, status: 'MATCHED' },
        bankMovement: { ...bankMovement, status: 'MATCHED' },
        matchType: 'MANUAL',
        matchConfidence: confidence,
        matchedAt: new Date(),
        matchedBy: 'USER', // TODO: Get from auth context
    };
}

/**
 * Remove match
 */
export function unmatchMovements(
    match: MatchedMovement
): { accounting: AccountingMovement; bank: BankMovement } {
    return {
        accounting: { ...match.accountingMovement, status: 'PENDING', matchedBankMovementId: undefined },
        bank: { ...match.bankMovement, status: 'PENDING', matchedAccountingMovementId: undefined },
    };
}
