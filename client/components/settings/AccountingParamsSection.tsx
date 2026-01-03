import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Calculator } from "lucide-react";
import { useState } from "react";
import type { AccountingParams } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface AccountingParamsSectionProps {
    params: AccountingParams;
    onUpdate: (params: AccountingParams) => void;
}

export function AccountingParamsSection({ params, onUpdate }: AccountingParamsSectionProps) {
    const [formData, setFormData] = useState<AccountingParams>(params);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Configuración Guardada",
            description: "Los parámetros contables se han actualizado correctamente.",
        });
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Parámetros Contables</h2>
                </div>
                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency & Format */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Moneda y Formato</h3>

                    <div>
                        <Label htmlFor="currency">Moneda Base</Label>
                        <Input
                            id="currency"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="mt-1"
                            disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Peso Colombiano (COP)
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="decimals">Número de Decimales</Label>
                        <Select
                            value={formData.decimals.toString()}
                            onValueChange={(value) => setFormData({ ...formData, decimals: parseInt(value) })}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">0 decimales</SelectItem>
                                <SelectItem value="2">2 decimales</SelectItem>
                                <SelectItem value="4">4 decimales</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="thousands">Sep. Miles</Label>
                            <Select
                                value={formData.thousandsSeparator}
                                onValueChange={(value: ',' | '.') => setFormData({ ...formData, thousandsSeparator: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=".">Punto (.)</SelectItem>
                                    <SelectItem value=",">Coma (,)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="decimal">Sep. Decimales</Label>
                            <Select
                                value={formData.decimalSeparator}
                                onValueChange={(value: ',' | '.') => setFormData({ ...formData, decimalSeparator: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=",">Coma (,)</SelectItem>
                                    <SelectItem value=".">Punto (.)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900 font-medium">Vista Previa</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                            $1{formData.thousandsSeparator}234{formData.thousandsSeparator}567{formData.decimalSeparator}
                            {formData.decimals === 0 ? '' : '89'.padEnd(formData.decimals, '0')}
                        </p>
                    </div>
                </div>

                {/* Accounting Methods */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Métodos Contables</h3>

                    <div>
                        <Label htmlFor="costing">Método de Costeo</Label>
                        <Select
                            value={formData.costingMethod}
                            onValueChange={(value: 'FIFO' | 'LIFO' | 'AVERAGE') => setFormData({ ...formData, costingMethod: value })}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIFO">PEPS (Primero en Entrar, Primero en Salir)</SelectItem>
                                <SelectItem value="LIFO">UEPS (Último en Entrar, Primero en Salir)</SelectItem>
                                <SelectItem value="AVERAGE">Promedio Ponderado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="cost-centers">Usar Centros de Costos</Label>
                                <p className="text-xs text-muted-foreground">Permite asignar costos a departamentos o proyectos</p>
                            </div>
                            <Switch
                                id="cost-centers"
                                checked={formData.useCostCenters}
                                onCheckedChange={(checked) => setFormData({ ...formData, useCostCenters: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="third-parties">Requiere Terceros</Label>
                                <p className="text-xs text-muted-foreground">Obliga a asociar clientes/proveedores en movimientos</p>
                            </div>
                            <Switch
                                id="third-parties"
                                checked={formData.requireThirdParties}
                                onCheckedChange={(checked) => setFormData({ ...formData, requireThirdParties: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="edit-posted">Permitir Editar Asientos Contabilizados</Label>
                                <p className="text-xs text-muted-foreground text-red-600">⚠️ No recomendado por auditoría</p>
                            </div>
                            <Switch
                                id="edit-posted"
                                checked={formData.allowEditPostedEntries}
                                onCheckedChange={(checked) => setFormData({ ...formData, allowEditPostedEntries: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="auto-close">Cierre Automático de Períodos</Label>
                                <p className="text-xs text-muted-foreground">Cierra períodos automáticamente al cambiar de mes</p>
                            </div>
                            <Switch
                                id="auto-close"
                                checked={formData.autoClosePeriods}
                                onCheckedChange={(checked) => setFormData({ ...formData, autoClosePeriods: checked })}
                            />
                        </div>
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Impuestos</h3>

                    <div>
                        <Label htmlFor="vat-rate">Tasa de IVA por Defecto (%)</Label>
                        <Input
                            id="vat-rate"
                            type="number"
                            value={formData.defaultVATRate}
                            onChange={(e) => setFormData({ ...formData, defaultVATRate: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                            min="0"
                            max="100"
                            step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Tarifa general de IVA en Colombia: 19%
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="auto-vat">Calcular IVA Automáticamente</Label>
                            <p className="text-xs text-muted-foreground">Agrega IVA en facturas de venta automáticamente</p>
                        </div>
                        <Switch
                            id="auto-vat"
                            checked={formData.autoCalculateVAT}
                            onCheckedChange={(checked) => setFormData({ ...formData, autoCalculateVAT: checked })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="retention-min">Base Mínima de Retención (COP)</Label>
                        <Input
                            id="retention-min"
                            type="number"
                            value={formData.minimumRetentionBase}
                            onChange={(e) => setFormData({ ...formData, minimumRetentionBase: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                            min="0"
                            step="1000"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Monto mínimo para aplicar retención en la fuente
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
