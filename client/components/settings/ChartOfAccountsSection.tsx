import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BookOpen, Plus, Search, Download } from "lucide-react";
import { useState } from "react";
import type { ChartOfAccount } from "@/types/settings";
import { ACCOUNT_TYPE_LABELS } from "@/types/settings";

interface ChartOfAccountsSectionProps {
    accounts: ChartOfAccount[];
    onUpdate: (accounts: ChartOfAccount[]) => void;
}

export function ChartOfAccountsSection({ accounts, onUpdate }: ChartOfAccountsSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAccounts = accounts.filter(acc =>
        acc.code.includes(searchTerm) ||
        acc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeBadge = (type: ChartOfAccount['type']) => {
        const colors = {
            ASSET: 'bg-blue-100 text-blue-800',
            LIABILITY: 'bg-red-100 text-red-800',
            EQUITY: 'bg-purple-100 text-purple-800',
            INCOME: 'bg-green-100 text-green-800',
            EXPENSE: 'bg-orange-100 text-orange-800',
        };
        return <Badge className={colors[type]}>{ACCOUNT_TYPE_LABELS[type]}</Badge>;
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Plan de Cuentas</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cuenta
                    </Button>
                </div>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código o nombre de cuenta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Naturaleza</TableHead>
                            <TableHead className="text-center">Nivel</TableHead>
                            <TableHead className="text-center">Movimiento</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccounts.map((account) => (
                            <TableRow key={account.code}>
                                <TableCell className="font-mono font-semibold">
                                    {account.code}
                                </TableCell>
                                <TableCell className={account.level === 1 ? 'font-bold' : ''}>
                                    {'  '.repeat(account.level - 1)}{account.name}
                                </TableCell>
                                <TableCell>{getTypeBadge(account.type)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {account.nature === 'DEBIT' ? 'Débito' : 'Crédito'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">{account.level}</TableCell>
                                <TableCell className="text-center">
                                    {account.isMovement ? '✅' : '➖'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {account.isActive ? (
                                        <Badge className="bg-green-100 text-green-800">Activa</Badge>
                                    ) : (
                                        <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {filteredAccounts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No se encontraron cuentas que coincidan con la búsqueda
                </div>
            )}
        </Card>
    );
}
