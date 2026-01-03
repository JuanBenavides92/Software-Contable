import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search } from "lucide-react";
import { useState } from "react";
import type { AuditFilters, AuditEventType, AuditSeverity, AuditModule } from "@/types/audit";
import {
    AUDIT_EVENT_LABELS,
    AUDIT_SEVERITY_LABELS,
    AUDIT_MODULE_LABELS,
} from "@/types/audit";
import { MOCK_USERS } from "@/data/mockAuditData";

interface AuditFiltersPanelProps {
    filters: AuditFilters;
    onApplyFilters: (filters: AuditFilters) => void;
    onClearFilters: () => void;
    onClose: () => void;
}

export function AuditFiltersPanel({
    filters,
    onApplyFilters,
    onClearFilters,
    onClose,
}: AuditFiltersPanelProps) {
    const [startDate, setStartDate] = useState(
        filters.dateRange?.startDate?.toISOString().split('T')[0] || ''
    );
    const [endDate, setEndDate] = useState(
        filters.dateRange?.endDate?.toISOString().split('T')[0] || ''
    );
    const [selectedUsers, setSelectedUsers] = useState<string[]>(filters.userIds || []);
    const [selectedModules, setSelectedModules] = useState<AuditModule[]>(filters.modules || []);
    const [selectedSeverities, setSelectedSeverities] = useState<AuditSeverity[]>(
        filters.severity || []
    );
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');

    const handleApply = () => {
        const newFilters: AuditFilters = {};

        if (startDate && endDate) {
            newFilters.dateRange = {
                startDate: new Date(startDate),
                endDate: new Date(endDate + 'T23:59:59'),
            };
        }

        if (selectedUsers.length > 0) {
            newFilters.userIds = selectedUsers;
        }

        if (selectedModules.length > 0) {
            newFilters.modules = selectedModules;
        }

        if (selectedSeverities.length > 0) {
            newFilters.severity = selectedSeverities;
        }

        if (searchTerm) {
            newFilters.searchTerm = searchTerm;
        }

        onApplyFilters(newFilters);
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        setSelectedUsers([]);
        setSelectedModules([]);
        setSelectedSeverities([]);
        setSearchTerm('');
        onClearFilters();
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleModule = (module: AuditModule) => {
        setSelectedModules(prev =>
            prev.includes(module)
                ? prev.filter(m => m !== module)
                : [...prev, module]
        );
    };

    const toggleSeverity = (severity: AuditSeverity) => {
        setSelectedSeverities(prev =>
            prev.includes(severity)
                ? prev.filter(s => s !== severity)
                : [...prev, severity]
        );
    };

    const modules: AuditModule[] = [
        'JOURNAL_ENTRIES',
        'REPORTS',
        'RECONCILIATION',
        'EXPORTS',
        'CERTIFICATES',
        'CONFIGURATION',
        'USER_MANAGEMENT',
    ];

    const severities: AuditSeverity[] = ['INFO', 'WARNING', 'CRITICAL'];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtros de Auditoría</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Date Range */}
                <div>
                    <Label className="text-sm font-semibold mb-3 block">Rango de Fechas</Label>
                    <div className="space-y-2">
                        <div>
                            <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                                Desde
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
                            <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                                Hasta
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

                {/* Users */}
                <div>
                    <Label className="text-sm font-semibold mb-3 block">Usuarios</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {MOCK_USERS.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`user-${user.id}`}
                                    checked={selectedUsers.includes(user.id)}
                                    onCheckedChange={() => toggleUser(user.id)}
                                />
                                <label
                                    htmlFor={`user-${user.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                >
                                    {user.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modules */}
                <div>
                    <Label className="text-sm font-semibold mb-3 block">Módulos</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {modules.map((module) => (
                            <div key={module} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`module-${module}`}
                                    checked={selectedModules.includes(module)}
                                    onCheckedChange={() => toggleModule(module)}
                                />
                                <label
                                    htmlFor={`module-${module}`}
                                    className="text-sm cursor-pointer flex-1"
                                >
                                    {AUDIT_MODULE_LABELS[module]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Severity */}
                <div>
                    <Label className="text-sm font-semibold mb-3 block">Severidad</Label>
                    <div className="space-y-2">
                        {severities.map((severity) => (
                            <div key={severity} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`severity-${severity}`}
                                    checked={selectedSeverities.includes(severity)}
                                    onCheckedChange={() => toggleSeverity(severity)}
                                />
                                <label
                                    htmlFor={`severity-${severity}`}
                                    className="text-sm cursor-pointer flex-1"
                                >
                                    {AUDIT_SEVERITY_LABELS[severity]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mt-6">
                <Label htmlFor="search" className="text-sm font-semibold mb-2 block">
                    Búsqueda
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="search"
                        type="text"
                        placeholder="Buscar por número de asiento, usuario, concepto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={handleClear}>
                    Limpiar Filtros
                </Button>
                <Button onClick={handleApply}>
                    Aplicar Filtros
                </Button>
            </div>
        </Card>
    );
}
