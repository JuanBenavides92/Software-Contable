import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Circle, Zap, Link as LinkIcon } from "lucide-react";
import type { AccountingMovement, BankMovement, MatchedMovement } from "@/types/reconciliation";
import { autoMatchMovements, createManualMatch, unmatchMovements } from "@/utils/reconciliationMatcher";
import { useState } from "react";

interface ReconciliationStep2MatchingProps {
    accountingMovements: AccountingMovement[];
    setAccountingMovements: (movements: AccountingMovement[]) => void;
    bankMovements: BankMovement[];
    setBankMovements: (movements: BankMovement[]) => void;
    matchedMovements: MatchedMovement[];
    setMatchedMovements: (movements: MatchedMovement[]) => void;
}

export function ReconciliationStep2Matching({
    accountingMovements,
    setAccountingMovements,
    bankMovements,
    setBankMovements,
    matchedMovements,
    setMatchedMovements,
}: ReconciliationStep2MatchingProps) {
    const [selectedAccounting, setSelectedAccounting] = useState<string | null>(null);
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    const handleAutoMatch = () => {
        const newMatches = autoMatchMovements(accountingMovements, bankMovements);
        setMatchedMovements([...matchedMovements, ...newMatches]);

        // Update movements status
        const updatedAccounting = accountingMovements.map(mov => {
            const match = newMatches.find(m => m.accountingMovement.id === mov.id);
            return match ? { ...mov, status: 'MATCHED' as const } : mov;
        });
        const updatedBank = bankMovements.map(mov => {
            const match = newMatches.find(m => m.bankMovement.id === mov.id);
            return match ? { ...mov, status: 'MATCHED' as const } : mov;
        });

        setAccountingMovements(updatedAccounting);
        setBankMovements(updatedBank);
    };

    const handleManualMatch = () => {
        if (!selectedAccounting || !selectedBank) return;

        const accMov = accountingMovements.find(m => m.id === selectedAccounting);
        const bankMov = bankMovements.find(m => m.id === selectedBank);

        if (!accMov || !bankMov) return;

        const newMatch = createManualMatch(accMov, bankMov);
        setMatchedMovements([...matchedMovements, newMatch]);

        // Update status
        setAccountingMovements(accountingMovements.map(m =>
            m.id === selectedAccounting ? { ...m, status: 'MATCHED' as const } : m
        ));
        setBankMovements(bankMovements.map(m =>
            m.id === selectedBank ? { ...m, status: 'MATCHED' as const } : m
        ));

        setSelectedAccounting(null);
        setSelectedBank(null);
    };

    const handleUnmatch = (matchId: string) => {
        const match = matchedMovements.find(m => m.id === matchId);
        if (!match) return;

        const { accounting, bank } = unmatchMovements(match);

        // Remove match
        setMatchedMovements(matchedMovements.filter(m => m.id !== matchId));

        // Update movements
        setAccountingMovements(accountingMovements.map(m =>
            m.id === accounting.id ? accounting : m
        ));
        setBankMovements(bankMovements.map(m =>
            m.id === bank.id ? bank : m
        ));
    };

    const pendingAccounting = accountingMovements.filter(m => m.status === 'PENDING');
    const pendingBank = bankMovements.filter(m => m.status === 'PENDING');

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Summary and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <Badge className="bg-blue-100 text-blue-800">
                        <Circle className="w-3 h-3 mr-1" />
                        {accountingMovements.length} Contables
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                        <Circle className="w-3 h-3 mr-1" />
                        {bankMovements.length} Bancarios
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {matchedMovements.length} Conciliados
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">
                        Pendientes: {pendingAccounting.length + pendingBank.length}
                    </Badge>
                </div>

                <Button onClick={handleAutoMatch} disabled={pendingAccounting.length === 0 || pendingBank.length === 0}>
                    <Zap className="w-4 h-4 mr-2" />
                    Matching Automático
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Pending Accounting Movements */}
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Movimientos Contables Pendientes ({pendingAccounting.length})</h3>
                    <div className="max-h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingAccounting.map((mov) => (
                                    <TableRow
                                        key={mov.id}
                                        className={`cursor-pointer ${selectedAccounting === mov.id ? 'bg-blue-100' : ''}`}
                                        onClick={() => setSelectedAccounting(mov.id)}
                                    >
                                        <TableCell>
                                            <div className={`w-4 h-4 rounded-full border-2 ${selectedAccounting === mov.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                                }`} />
                                        </TableCell>
                                        <TableCell className="text-sm">{formatDate(mov.date)}</TableCell>
                                        <TableCell className="text-sm">{mov.concept}</TableCell>
                                        <TableCell className={`text-sm text-right ${mov.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                                            {mov.type === 'DEBIT' ? '-' : '+'}{formatCurrency(mov.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Pending Bank Movements */}
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Movimientos Bancarios Pendientes ({pendingBank.length})</h3>
                    <div className="max-h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingBank.map((mov) => (
                                    <TableRow
                                        key={mov.id}
                                        className={`cursor-pointer ${selectedBank === mov.id ? 'bg-purple-100' : ''}`}
                                        onClick={() => setSelectedBank(mov.id)}
                                    >
                                        <TableCell>
                                            <div className={`w-4 h-4 rounded-full border-2 ${selectedBank === mov.id ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                                                }`} />
                                        </TableCell>
                                        <TableCell className="text-sm">{formatDate(mov.date)}</TableCell>
                                        <TableCell className="text-sm">{mov.concept}</TableCell>
                                        <TableCell className={`text-sm text-right ${mov.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                                            {mov.type === 'DEBIT' ? '-' : '+'}{formatCurrency(mov.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Manual Match Button */}
            {selectedAccounting && selectedBank && (
                <div className="flex justify-center">
                    <Button onClick={handleManualMatch} size="lg">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Conciliar Seleccionados
                    </Button>
                </div>
            )}

            {/* Matched Movements */}
            <Card className="p-4">
                <h3 className="font-semibold mb-3">Movimientos Conciliados ({matchedMovements.length})</h3>
                <div className="max-h-64 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Concepto (Contable)</TableHead>
                                <TableHead>Concepto (Banco)</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Confianza</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matchedMovements.map((match) => (
                                <TableRow key={match.id}>
                                    <TableCell className="text-sm">{formatDate(match.accountingMovement.date)}</TableCell>
                                    <TableCell className="text-sm">{match.accountingMovement.concept}</TableCell>
                                    <TableCell className="text-sm">{match.bankMovement.concept}</TableCell>
                                    <TableCell className="text-sm text-right">{formatCurrency(match.accountingMovement.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={match.matchType === 'AUTOMATIC' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                            {match.matchType === 'AUTOMATIC' ? 'Auto' : 'Manual'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-right">{match.matchConfidence}%</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUnmatch(match.id)}
                                        >
                                            Deshacer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
