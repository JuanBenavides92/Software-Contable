import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Hash, Save, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { DocumentNumbering } from "@/types/settings";
import { DOCUMENT_TYPE_LABELS } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface DocumentNumberingSectionProps {
    numbering: DocumentNumbering[];
    onUpdate: (numbering: DocumentNumbering[]) => void;
}

export function DocumentNumberingSection({ numbering, onUpdate }: DocumentNumberingSectionProps) {
    const [formData, setFormData] = useState<DocumentNumbering[]>(numbering);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Numeración Actualizada",
            description: "La configuración de numeración se ha guardado correctamente.",
        });
    };

    const updateNumbering = (id: string, field: keyof DocumentNumbering, value: any) => {
        const updated = formData.map(n =>
            n.id === id ? { ...n, [field]: value } : n
        );
        setFormData(updated);
    };

    const getPreview = (item: DocumentNumbering) => {
        const year = item.includeYear ? new Date().getFullYear() + '-' : '';
        const number = item.currentNumber.toString().padStart(item.padding, '0');
        return `${item.prefix}${year}${number}`;
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Numeración de Documentos</h2>
                </div>
                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tipo de Documento</TableHead>
                            <TableHead>Prefijo</TableHead>
                            <TableHead className="text-center">Incluir Año</TableHead>
                            <TableHead className="text-right">Número Actual</TableHead>
                            <TableHead className="text-right">Padding</TableHead>
                            <TableHead className="text-center">Reset Anual</TableHead>
                            <TableHead>Vista Previa</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {DOCUMENT_TYPE_LABELS[item.documentType]}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={item.prefix}
                                        onChange={(e) => updateNumbering(item.id, 'prefix', e.target.value)}
                                        className="w-24"
                                        placeholder="JE-"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Switch
                                        checked={item.includeYear}
                                        onCheckedChange={(checked) => updateNumbering(item.id, 'includeYear', checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.currentNumber}
                                        onChange={(e) => updateNumbering(item.id, 'currentNumber', parseInt(e.target.value) || 1)}
                                        className="w-24 text-right"
                                        min="1"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.padding}
                                        onChange={(e) => updateNumbering(item.id, 'padding', parseInt(e.target.value) || 4)}
                                        className="w-20 text-right"
                                        min="1"
                                        max="10"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Switch
                                        checked={item.resetYearly}
                                        onCheckedChange={(checked) => updateNumbering(item.id, 'resetYearly', checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        {getPreview(item)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                    <strong>Nota:</strong> Los cambios en la numeración afectarán solo a los nuevos documentos creados.
                    Los documentos existentes mantendrán su numeración original.
                </p>
            </div>
        </Card>
    );
}
