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
import { FileText, Save, Upload, Shield } from "lucide-react";
import { useState } from "react";
import type { DIANConfig } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface DIANConfigurationSectionProps {
    dian: DIANConfig;
    onUpdate: (dian: DIANConfig) => void;
}

export function DIANConfigurationSection({ dian, onUpdate }: DIANConfigurationSectionProps) {
    const [formData, setFormData] = useState<DIANConfig>(dian);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Configuración DIAN Guardada",
            description: "La configuración de facturación electrónica se ha actualizado correctamente.",
        });
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Configuración DIAN - Facturación Electrónica</h2>
                </div>
                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold">Configuración General</h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="fe-enabled">Facturación Electrónica</Label>
                            <p className="text-xs text-muted-foreground">Habilitar sistema de facturación electrónica</p>
                        </div>
                        <Switch
                            id="fe-enabled"
                            checked={formData.electronicInvoicing}
                            onCheckedChange={(checked) => setFormData({ ...formData, electronicInvoicing: checked })}
                        />
                    </div>

                    {formData.electronicInvoicing && (
                        <>
                            <div>
                                <Label htmlFor="software-id">Software ID</Label>
                                <Input
                                    id="software-id"
                                    value={formData.softwareId || ''}
                                    onChange={(e) => setFormData({ ...formData, softwareId: e.target.value })}
                                    className="mt-1"
                                    placeholder="SOFTWARE-123456"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Otorgado por la DIAN al habilitar el software
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="pin">PIN de Software</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    value={formData.pin || ''}
                                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                                    className="mt-1"
                                    placeholder="•••••"
                                />
                            </div>

                            <div>
                                <Label htmlFor="environment">Ambiente</Label>
                                <Select
                                    value={formData.environment}
                                    onValueChange={(value: 'TESTING' | 'PRODUCTION') =>
                                        setFormData({ ...formData, environment: value })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TESTING">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-yellow-600" />
                                                Pruebas (Habilitación)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PRODUCTION">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-green-600" />
                                                Producción
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="cert">Certificado Digital (.p12)</Label>
                                <div className="mt-1 flex items-center gap-3">
                                    <Button variant="outline" size="sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Subir Certificado
                                    </Button>
                                    {formData.certificate && (
                                        <span className="text-sm text-green-600">✓ Certificado cargado</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="cert-password">Contraseña del Certificado</Label>
                                <Input
                                    id="cert-password"
                                    type="password"
                                    value={formData.certificatePassword || ''}
                                    onChange={(e) => setFormData({ ...formData, certificatePassword: e.target.value })}
                                    className="mt-1"
                                    placeholder="•••••••"
                                />
                            </div>

                            {formData.certificateExpiry && (
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-yellow-900 font-medium">Vencimiento del Certificado</p>
                                    <p className="text-sm text-yellow-700">
                                        {new Date(formData.certificateExpiry).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {formData.electronicInvoicing && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Resolución de Facturación</h3>

                        <div>
                            <Label htmlFor="resolution">Número de Resolución</Label>
                            <Input
                                id="resolution"
                                value={formData.resolutionNumber || ''}
                                onChange={(e) => setFormData({ ...formData, resolutionNumber: e.target.value })}
                                className="mt-1"
                                placeholder="18760000001"
                            />
                        </div>

                        <div>
                            <Label htmlFor="resolution-date">Fecha de Resolución</Label>
                            <Input
                                id="resolution-date"
                                type="date"
                                value={formData.resolutionDate ? new Date(formData.resolutionDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, resolutionDate: new Date(e.target.value) })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="prefix">Prefijo Autorizado</Label>
                            <Input
                                id="prefix"
                                value={formData.authorizedPrefix || ''}
                                onChange={(e) => setFormData({ ...formData, authorizedPrefix: e.target.value })}
                                className="mt-1"
                                placeholder="SETP"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="range-from">Rango Desde</Label>
                                <Input
                                    id="range-from"
                                    type="number"
                                    value={formData.rangeFrom || ''}
                                    onChange={(e) => setFormData({ ...formData, rangeFrom: parseInt(e.target.value) || undefined })}
                                    className="mt-1"
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="range-to">Rango Hasta</Label>
                                <Input
                                    id="range-to"
                                    type="number"
                                    value={formData.rangeTo || ''}
                                    onChange={(e) => setFormData({ ...formData, rangeTo: parseInt(e.target.value) || undefined })}
                                    className="mt-1"
                                    placeholder="5000"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="valid-until">Vigencia Hasta</Label>
                            <Input
                                id="valid-until"
                                type="date"
                                value={formData.validUntil ? new Date(formData.validUntil).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, validUntil: new Date(e.target.value) })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="technical-key">Clave Técnica</Label>
                            <Input
                                id="technical-key"
                                type="password"
                                value={formData.technicalKey || ''}
                                onChange={(e) => setFormData({ ...formData, technicalKey: e.target.value })}
                                className="mt-1"
                                placeholder="•••••••••••••"
                            />
                        </div>
                    </div>
                )}
            </div>

            {!formData.electronicInvoicing && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                        <strong>Facturación Electrónica Deshabilitada:</strong> Habilita la facturación electrónica para
                        cumplir con la normativa DIAN y emitir facturas electrónicas válidas.
                    </p>
                </div>
            )}
        </Card>
    );
}
