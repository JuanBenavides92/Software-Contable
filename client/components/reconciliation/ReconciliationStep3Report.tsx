import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Save, FileCheck } from "lucide-react";
import type {
    BankAccount,
    AccountingMovement,
    BankMovement,
    MatchedMovement,
    BankReconciliation,
    Discrepancy,
} from "@/types/reconciliation";

interface ReconciliationStep3ReportProps {
    bankAccount: BankAccount;
    period: {
        startDate: Date;
        endDate: Date;
    };
    openingBalanceAccounting: number;
    openingBalanceBank: number;
    accountingMovements: AccountingMovement[];
    bankMovements: BankMovement[];
    matchedMovements: MatchedMovement[];
    onComplete: (reconciliation: BankReconciliation) => void;
}

export function ReconciliationStep3Report({
    bankAccount,
    period,
    openingBalanceAccounting,
    openingBalanceBank,
    accountingMovements,
    bankMovements,
    matchedMovements,
    onComplete,
}: ReconciliationStep3ReportProps) {
    // Calculate matched IDs
    const matchedAccountingIds = new Set(matchedMovements.map(m => m.accountingMovement.id));
    const matchedBankIds = new Set(matchedMovements.map(m => m.bankMovement.id));

    // Unmatched movements
    const unmatchedAccounting = accountingMovements.filter(m => !matchedAccountingIds.has(m.id));
    const unmatchedBank = bankMovements.filter(m => !matchedBankIds.has(m.id));

    // Calculate balances
    const totalDebitsAccounting = accountingMovements
        .filter(m => m.type === 'DEBIT')
        .reduce((sum, m) => sum + m.amount, 0);
    const totalCreditsAccounting = accountingMovements
        .filter(m => m.type === 'CREDIT')
        .reduce((sum, m) => sum + m.amount, 0);

    const closingBalanceAccounting = openingBalanceAccounting + totalCreditsAccounting - totalDebitsAccounting;

    const totalDebitsBank = bankMovements
        .filter(m => m.type === 'DEBIT')
        .reduce((sum, m) => sum + m.amount, 0);
    const totalCreditsBank = bankMovements
        .filter(m => m.type === 'CREDIT')
        .reduce((sum, m) => sum + m.amount, 0);

    const closingBalanceBank = openingBalanceBank + totalCreditsBank - totalDebitsBank;

    // Calculate adjustments (unmatched bank movements that need to be recorded)
    const bankCharges = unmatchedBank.filter(m => m.type === 'DEBIT' && m.concept.toLowerCase().includes('comisión'));
    const bankInterests = unmatchedBank.filter(m => m.type === 'CREDIT' && m.concept.toLowerCase().includes('interés'));

    const totalBankCharges = bankCharges.reduce((sum, m) => sum + m.amount, 0);
    const totalBankInterests = bankInterests.reduce((sum, m) => sum + m.amount, 0);

    // Adjusted accounting balance
    const adjustedBalanceAccounting = closingBalanceAccounting - totalBankCharges + totalBankInterests;

    // In-transit items (unmatched accounting movements)
    const depositsInTransit = unmatchedAccounting.filter(m => m.type === 'CREDIT');
    const checksOutstanding = unmatchedAccounting.filter(m => m.type === 'DEBIT');

    const totalDepositsInTransit = depositsInTransit.reduce((sum, m) => sum + m.amount, 0);
    const totalChecksOutstanding = checksOutstanding.reduce((sum, m) => sum + m.amount, 0);

    // Reconciled balance
    const reconciledBalance = closingBalanceBank + totalDepositsInTransit - totalChecksOutstanding;

    // Final difference
    const difference = Math.abs(adjustedBalanceAccounting - reconciledBalance);
    const isReconciled = difference < 0.01;

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleComplete = (status: 'IN_PROGRESS' | 'COMPLETED') => {
        const discrepancies: Discrepancy[] = [
            ...depositsInTransit.map(m => ({
                id: `disc-${m.id}`,
                type: 'IN_TRANSIT' as const,
                subType: 'DEPOSIT_IN_TRANSIT' as const,
                source: 'ACCOUNTING' as const,
                movement: m,
                amount: m.amount,
                requiresAdjustment: false,
            })),
            ...checksOutstanding.map(m => ({
                id: `disc-${m.id}`,
                type: 'IN_TRANSIT' as const,
                subType: 'CHECK_OUTSTANDING' as const,
                source: 'ACCOUNTING' as const,
                movement: m,
                amount: m.amount,
                requiresAdjustment: false,
            })),
            ...bankCharges.map(m => ({
                id: `disc-${m.id}`,
                type: 'NOT_RECORDED' as const,
                subType: 'BANK_CHARGE' as const,
                source: 'BANK' as const,
                movement: m,
                amount: m.amount,
                requiresAdjustment: true,
            })),
            ...bankInterests.map(m => ({
                id: `disc-${m.id}`,
                type: 'NOT_RECORDED' as const,
                subType: 'BANK_INTEREST' as const,
                source: 'BANK' as const,
                movement: m,
                amount: m.amount,
                requiresAdjustment: true,
            })),
        ];

        const reconciliation: BankReconciliation = {
            id: `rec-${Date.now()}`,
            bankAccountId: bankAccount.id,
            period,
            openingBalanceAccounting,
            closingBalanceAccounting,
            openingBalanceBank,
            closingBalanceBank,
            accountingMovements,
            bankMovements,
            matchedMovements,
            discrepancies,
            status,
            reconciledBalance,
            difference,
            createdAt: new Date(),
            createdBy: 'CURRENT_USER', // TODO: Get from auth
        };

        if (status === 'COMPLETED') {
            reconciliation.completedAt = new Date();
        }

        onComplete(reconciliation);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold">Reporte de Conciliación Bancaria</h2>
                <p className="text-muted-foreground mt-1">
                    {bankAccount.bankName} - Cuenta {bankAccount.accountNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                    Período: {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </p>
            </div>

            {/* According to Books */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">SEGÚN LIBROS CONTABLES</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Saldo inicial según libros</span>
                        <span className="font-mono">{formatCurrency(openingBalanceAccounting)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>(+) Depósitos y créditos del período</span>
                        <span className="font-mono">{formatCurrency(totalCreditsAccounting)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                        <span>(-) Retiros y débitos del período</span>
                        <span className="font-mono">({formatCurrency(totalDebitsAccounting)})</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Saldo final según libros</span>
                        <span className="font-mono">{formatCurrency(closingBalanceAccounting)}</span>
                    </div>

                    {(totalBankCharges > 0 || totalBankInterests > 0) && (
                        <>
                            <div className="mt-4 mb-2 font-medium">Más/Menos: Ajustes</div>
                            {totalBankCharges > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        (-) Comisiones bancarias no registradas
                                    </span>
                                    <span className="font-mono">({formatCurrency(totalBankCharges)})</span>
                                </div>
                            )}
                            {totalBankInterests > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        (+) Intereses ganados no registrados
                                    </span>
                                    <span className="font-mono">{formatCurrency(totalBankInterests)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>SALDO AJUSTADO SEGÚN LIBROS</span>
                                <span className="font-mono">{formatCurrency(adjustedBalanceAccounting)}</span>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* According to Bank */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">SEGÚN EXTRACTO BANCARIO</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-semibold">
                        <span>Saldo según extracto bancario</span>
                        <span className="font-mono">{formatCurrency(closingBalanceBank)}</span>
                    </div>

                    {totalDepositsInTransit > 0 && (
                        <>
                            <div className="mt-4 mb-2 font-medium">Más: Depósitos en tránsito</div>
                            {depositsInTransit.map(dep => (
                                <div key={dep.id} className="flex justify-between text-green-600 pl-4 text-xs">
                                    <span>{formatDate(dep.date)} - {dep.concept}</span>
                                    <span className="font-mono">{formatCurrency(dep.amount)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Total depósitos en tránsito</span>
                                <span className="font-mono">{formatCurrency(totalDepositsInTransit)}</span>
                            </div>
                        </>
                    )}

                    {totalChecksOutstanding > 0 && (
                        <>
                            <div className="mt-4 mb-2 font-medium">Menos: Cheques pendientes de cobro</div>
                            {checksOutstanding.map(check => (
                                <div key={check.id} className="flex justify-between text-red-600 pl-4 text-xs">
                                    <span>{formatDate(check.date)} - {check.concept}</span>
                                    <span className="font-mono">({formatCurrency(check.amount)})</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-red-600 font-medium">
                                <span>Total cheques pendientes</span>
                                <span className="font-mono">({formatCurrency(totalChecksOutstanding)})</span>
                            </div>
                        </>
                    )}

                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>SALDO CONCILIADO</span>
                        <span className="font-mono">{formatCurrency(reconciledBalance)}</span>
                    </div>
                </div>
            </Card>

            {/* Result */}
            <Card className={`p-6 ${isReconciled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isReconciled ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        )}
                        <div>
                            <div className="font-semibold text-lg">
                                {isReconciled ? '✅ Conciliación Exitosa' : '⚠️ Diferencia Detectada'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Diferencia final: {formatCurrency(difference)}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Movimientos conciliados</div>
                        <div className="text-2xl font-bold">{matchedMovements.length}/{accountingMovements.length + bankMovements.length}</div>
                    </div>
                </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => handleComplete('IN_PROGRESS')}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Borrador
                </Button>
                <Button onClick={() => handleComplete('COMPLETED')} disabled={!isReconciled}>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Completar Conciliación
                </Button>
            </div>
        </div>
    );
}
