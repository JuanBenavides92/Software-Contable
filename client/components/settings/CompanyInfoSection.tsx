import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Building2, Upload } from "lucide-react";
import { useState } from "react";
import type { CompanyInfo, OrganizationType, TaxRegime, FiscalResponsibility } from "@/types/settings";
import {
    ORGANIZATION_TYPE_LABELS,
    TAX_REGIME_LABELS,
    FISCAL_RESPONSIBILITY_LABELS,
} from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface CompanyInfoSectionProps {
    company: CompanyInfo;
    onUpdate: (company: CompanyInfo) => void;
}

export function CompanyInfoSection({ company, onUpdate }: CompanyInfoSectionProps) {
    const [formData, setFormData] = useState<CompanyInfo>(company);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Información Guardada",
            description: "Los datos de la empresa se han actualizado correctamente.",
        });
    };

    const toggleResponsibility = (resp: FiscalResponsibility) => {
        const current = formData.fiscalResponsibilities;
        const updated = current.includes(resp)
            ? current.filter(r => r !== resp)
            : [...current, resp];
        setFormData({ ...formData, fiscalResponsibilities: updated });
    };

    const organizations: OrganizationType[] = ['SAS', 'LTDA', 'SA', 'PERSONA_NATURAL', 'ONG', 'OTRO'];
    const regimes: TaxRegime[] = ['COMUN', 'SIMPLIFICADO', 'NO_RESPONSABLE', 'GRAN_CONTRIBUYENTE'];
    const responsibilities: FiscalResponsibility[] = [
        'IVA',
        'RETENCION_FUENTE',
        'RETENCION_IVA',
        'ICA',
        'GRAN_CONTRIBUYENTE',
        'AUTORETENEDOR',
    ];

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Información de la Empresa</h2>
                    </div>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Datos Básicos</h3>

                        <div>
                            <Label htmlFor="legalName">Razón Social <span className="text-red-500">*</span></Label>
                            <Input
                                id="legalName"
                                value={formData.legalName}
                                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="commercialName">Nombre Comercial</Label>
                            <Input
                                id="commercialName"
                                value={formData.commercialName || ''}
                                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-3">
                                <Label htmlFor="nit">NIT <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nit"
                                    value={formData.nit}
                                    onChange={(e) => setFormData({ ...formData, nit: e.target.value.replace(/\D/g, '') })}
                                    className="mt-1"
                                    placeholder="900123456"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dv">DV</Label>
                                <Input
                                    id="dv"
                                    value={formData.verificationDigit}
                                    onChange={(e) => setFormData({ ...formData, verificationDigit: e.target.value.replace(/\D/g, '').slice(0, 1) })}
                                    className="mt-1"
                                    maxLength={1}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="orgType">Tipo de Organización</Label>
                            <Select
                                value={formData.organizationType}
                                onValueChange={(value: OrganizationType) => setFormData({ ...formData, organizationType: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(org => (
                                        <SelectItem key={org} value={org}>
                                            {ORGANIZATION_TYPE_LABELS[org]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="constitutionDate">Fecha de Constitución</Label>
                            <Input
                                id="constitutionDate"
                                type="date"
                                value={formData.constitutionDate.toISOString().split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, constitutionDate: new Date(e.target.value) })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Ubicación</h3>

                        <div>
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="department">Departamento</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="country">País</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1"
                                placeholder="+57 (1) 6543210"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="website">Sitio Web</Label>
                            <Input
                                id="website"
                                value={formData.website || ''}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="mt-1"
                                placeholder="www.empresa.com"
                            />
                        </div>
                    </div>

                    {/* Tax Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Información Tributaria</h3>

                        <div>
                            <Label htmlFor="taxRegime">Régimen Tributario</Label>
                            <Select
                                value={formData.taxRegime}
                                onValueChange={(value: TaxRegime) => setFormData({ ...formData, taxRegime: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {regimes.map(regime => (
                                        <SelectItem key={regime} value={regime}>
                                            {TAX_REGIME_LABELS[regime]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-2 block">Responsabilidades Fiscales</Label>
                            <div className="space-y-2">
                                {responsibilities.map(resp => (
                                    <div key={resp} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`resp-${resp}`}
                                            checked={formData.fiscalResponsibilities.includes(resp)}
                                            onCheckedChange={() => toggleResponsibility(resp)}
                                        />
                                        <label htmlFor={`resp-${resp}`} className="text-sm cursor-pointer">
                                            {FISCAL_RESPONSIBILITY_LABELS[resp]}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="economicActivity">Actividad Económica (CIIU)</Label>
                            <Input
                                id="economicActivity"
                                value={formData.economicActivity}
                                onChange={(e) => setFormData({ ...formData, economicActivity: e.target.value })}
                                className="mt-1"
                                placeholder="6920"
                            />
                        </div>

                        <div>
                            <Label htmlFor="legalRep">Representante Legal</Label>
                            <Input
                                id="legalRep"
                                value={formData.legalRepresentative}
                                onChange={(e) => setFormData({ ...formData, legalRepresentative: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Branding</h3>

                        <div>
                            <Label htmlFor="logo">Logo de la Empresa</Label>
                            <div className="mt-1 flex items-center gap-3">
                                <Button variant="outline" size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Subir Logo
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Formatos: PNG, JPG (Max: 2MB)
                                </span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="color">Color Primario</Label>
                            <div className="mt-1 flex items-center gap-3">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.primaryColor || '#3B82F6'}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={formData.primaryColor || '#3B82F6'}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="flex-1"
                                    placeholder="#3B82F6"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="footer">Pie de Página en Reportes</Label>
                            <Textarea
                                id="footer"
                                value={formData.reportFooter || ''}
                                onChange={(e) => setFormData({ ...formData, reportFooter: e.target.value })}
                                className="mt-1"
                                rows={3}
                                placeholder="Texto que aparecerá en el pie de página de todos los reportes"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
