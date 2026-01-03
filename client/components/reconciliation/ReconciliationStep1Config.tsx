import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import type { BankAccount, AccountingMovement, BankMovement } from "@/types/reconciliation";
import { MOCK_BANK_ACCOUNTS, MOCK_ACCOUNTING_MOVEMENTS, MOCK_INITIAL_BALANCE } from "@/data/mockReconciliationData";
import { parseCSVBankStatement, downloadCSVTemplate } from "@/utils/csvBankParser";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReconciliationStep1ConfigProps {
    selectedAccount: BankAccount | null;
    setSelectedAccount: (account: BankAccount | null) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    openingBalanceAccounting: number;
    setOpeningBalanceAccounting: (balance: number) => void;
    openingBalanceBank: number;
    setOpeningBalanceBank: (balance: number) => void;
    accountingMovements: AccountingMovement[];
    setAccountingMovements: (movements: AccountingMovement[]) => void;
    bankMovements: BankMovement[];
    setBankMovements: (movements: BankMovement[]) => void;
}

export function ReconciliationStep1Config({
    selectedAccount,
    setSelectedAccount,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    openingBalanceAccounting,
    setOpeningBalanceAccounting,
    openingBalanceBank,
    setOpeningBalanceBank,
    accountingMovements,
    setAccountingMovements,
    bankMovements,
    setBankMovements,
}: ReconciliationStep1ConfigProps) {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleAccountChange = (accountId: string) => {
        const account = MOCK_BANK_ACCOUNTS.find(a => a.id === accountId);
        setSelectedAccount(account || null);

        // Auto-load accounting movements (in real app, fetch from backend)
        if (account) {
            setAccountingMovements(MOCK_ACCOUNTING_MOVEMENTS);
            setOpeningBalanceAccounting(MOCK_INITIAL_BALANCE);
            setOpeningBalanceBank(MOCK_INITIAL_BALANCE);
        }
    };

    const handleCSVFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCsvFile(file);

        // Parse CSV
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvContent = e.target?.result as string;
                const parsedMovements = parseCSVBankStatement(csvContent);
                setBankMovements(parsedMovements);

                toast({
                    title: "✅ Archivo Importado",
                    description: `Se importaron ${parsedMovements.length} movimientos bancarios exitosamente.`,
                });
            } catch (error) {
                toast({
                    title: "❌ Error al Importar",
                    description: error instanceof Error ? error.message : 'Error desconocido',
                    variant: "destructive",
                });
                setCsvFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const balancesMatch = Math.abs(openingBalanceAccounting - openingBalanceBank) < 0.01;

    return (
        <div className="space-y-6">
            {/* Account Selection */}
            <div>
                <Label htmlFor="account" className="text-base font-semibold">
                    Cuenta Bancaria <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedAccount?.id}
                    onValueChange={handleAccountChange}
                >
                    <SelectTrigger id="account" className="mt-2">
                        <SelectValue placeholder="Selecciona una cuenta bancaria" />
                    </SelectTrigger>
                    <SelectContent>
                        {MOCK_BANK_ACCOUNTS.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.bankName} - {account.accountType === 'CHECKING' ? 'Corriente' : 'Ahorros'} {account.accountNumber}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Period Selection */}
            <div>
                <Label className="text-base font-semibold mb-2 block">
                    Período a Conciliar <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                            Fecha Inicio
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                            Fecha Fin
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>
            </div>

            {/* Opening Balances */}
            <div>
                <Label className="text-base font-semibold mb-2 block">
                    Saldos Iniciales
                </Label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="balanceAccounting" className="text-sm text-muted-foreground">
                            Saldo según libros
                        </Label>
                        <Input
                            id="balanceAccounting"
                            type="number"
                            value={openingBalanceAccounting}
                            onChange={(e) => setOpeningBalanceAccounting(parseFloat(e.target.value) || 0)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="balanceBank" className="text-sm text-muted-foreground">
                            Saldo según banco
                        </Label>
                        <Input
                            id="balanceBank"
                            type="number"
                            value={openingBalanceBank}
                            onChange={(e) => setOpeningBalanceBank(parseFloat(e.target.value) || 0)}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Balance Match Indicator */}
                <div className="mt-2">
                    {balancesMatch ? (
                        <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Saldos iniciales coinciden
                        </Badge>
                    ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Diferencia: ${Math.abs(openingBalanceAccounting - openingBalanceBank).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </Badge>
                    )}
                </div>
            </div>

            {/* CSV Import */}
            <div>
                <Label className="text-base font-semibold mb-2 block">
                    Extracto Bancario <span className="text-red-500">*</span>
                </Label>

                <Card className="p-4">
                    <div className="space-y-4">
                        {/* File Upload */}
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleCSVFileChange}
                                className="hidden"
                                id="csv-upload"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {csvFile ? 'Cambiar Archivo CSV' : 'Seleccionar Archivo CSV'}
                            </Button>
                            {csvFile && (
                                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    {csvFile.name}
                                </div>
                            )}
                        </div>

                        {/* Template Download */}
                        <div className="flex items-center justify-center">
                            <Button
                                variant="link"
                                size="sm"
                                onClick={downloadCSVTemplate}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Plantilla CSV
                            </Button>
                        </div>

                        {/* Info */}
                        <Card className="p-3 bg-blue-50 border-blue-200">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="text-xs text-blue-700">
                                    <strong>Formato CSV requerido:</strong> Fecha, Tipo, Concepto, Referencia, Débito, Crédito, Saldo.
                                    Descarga la plantilla para conocer el formato exacto.
                                </div>
                            </div>
                        </Card>
                    </div>
                </Card>
            </div>

            {/* Summary */}
            {selectedAccount && accountingMovements.length > 0 && bankMovements.length > 0 && (
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <div className="font-semibold text-green-900 mb-2">Datos Cargados</div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                                <div>
                                    <div className="font-medium">Movimientos Contables</div>
                                    <div>{accountingMovements.length} movimientos</div>
                                </div>
                                <div>
                                    <div className="font-medium">Movimientos Bancarios</div>
                                    <div>{bankMovements.length} movimientos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
