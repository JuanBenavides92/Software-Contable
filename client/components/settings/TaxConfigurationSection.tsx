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
import { Receipt, Save, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TaxConfiguration, RetentionConfig } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface TaxConfigurationSectionProps {
    tax: TaxConfiguration;
    onUpdate: (tax: TaxConfiguration) => void;
}

export function TaxConfigurationSection({ tax, onUpdate }: TaxConfigurationSectionProps) {
    const [formData, setFormData] = useState<TaxConfiguration>(tax);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Configuración de Impuestos Guardada",
            description: "La configuración tributaria se ha actualizado correctamente.",
        });
    };

    const addRetention = () => {
        const newRetention: RetentionConfig = {
            id: `ret-${Date.now()}`,
            concept: '',
            rate: 0,
            minimumBase: 1000000,
            applicableFor: 'PURCHASES',
        };
        setFormData({
            ...formData,
            retentions: [...formData.retentions, newRetention],
        });
    };

    const removeRetention = (id: string) => {
        setFormData({
            ...formData,
            retentions: formData.retentions.filter(r => r.id !== id),
        });
    };

    const updateRetention = (id: string, field: keyof RetentionConfig, value: any) => {
        const updated = formData.retentions.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        );
        setFormData({ ...formData, retentions: updated });
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Configuración de Impuestos</h2>
                    </div>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </div>

                {/* IVA */}
                <div className="space-y-4 mb-8">
                    <h3 className="font-semibold">Impuesto al Valor Agregado (IVA)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="vat-general">Tarifa General (%)</Label>
                            <Input
                                id="vat-general"
                                type="number"
                                value={formData.vat.generalRate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vat: { ...formData.vat, generalRate: parseFloat(e.target.value) || 0 }
                                })}
                                className="mt-1"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <Label htmlFor="vat-reduced">Tarifa Reducida (%)</Label>
                            <Input
                                id="vat-reduced"
                                type="number"
                                value={formData.vat.reducedRate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vat: { ...formData.vat, reducedRate: parseFloat(e.target.value) || 0 }
                                })}
                                className="mt-1"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Retenciones */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Retención en la Fuente</h3>
                        <Button variant="outline" size="sm" onClick={addRetention}>
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Retención
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {formData.retentions.map((retention) => (
                            <div key={retention.id} className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <Label className="text-xs">Concepto</Label>
                                    <Input
                                        value={retention.concept}
                                        onChange={(e) => updateRetention(retention.id, 'concept', e.target.value)}
                                        className="mt-1"
                                        placeholder="Servicios"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Tasa (%)</Label>
                                    <Input
                                        type="number"
                                        value={retention.rate}
                                        onChange={(e) => updateRetention(retention.id, 'rate', parseFloat(e.target.value) || 0)}
                                        className="mt-1"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Base Mínima</Label>
                                    <Input
                                        type="number"
                                        value={retention.minimumBase}
                                        onChange={(e) => updateRetention(retention.id, 'minimumBase', parseFloat(e.target.value) || 0)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Aplicable a</Label>
                                    <Select
                                        value={retention.applicableFor}
                                        onValueChange={(value: 'PURCHASES' | 'SALES' | 'BOTH') =>
                                            updateRetention(retention.id, 'applicableFor', value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PURCHASES">Compras</SelectItem>
                                            <SelectItem value="SALES">Ventas</SelectItem>
                                            <SelectItem value="BOTH">Ambas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRetention(retention.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}
