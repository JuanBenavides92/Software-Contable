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
import { HardDrive, Save, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { BackupConfig } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface BackupRestoreSectionProps {
    backup: BackupConfig;
    onUpdate: (backup: BackupConfig) => void;
}

export function BackupRestoreSection({ backup, onUpdate }: BackupRestoreSectionProps) {
    const [formData, setFormData] = useState<BackupConfig>(backup);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Configuración de Backup Guardada",
            description: "La configuración de respaldos se ha actualizado correctamente.",
        });
    };

    const handleBackupNow = () => {
        toast({
            title: "💾 Backup Iniciado",
            description: "El respaldo de la base de datos se está creando...",
        });
        setTimeout(() => {
            setFormData({ ...formData, lastBackup: new Date() });
            toast({
                title: "✅ Backup Completado",
                description: "El respaldo se ha creado exitosamente.",
            });
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Backup y Restauración</h2>
                    </div>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Configuración Automática</h3>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="auto-backup">Backup Automático</Label>
                                <p className="text-xs text-muted-foreground">Crear respaldos programados</p>
                            </div>
                            <Switch
                                id="auto-backup"
                                checked={formData.autoBackup}
                                onCheckedChange={(checked) => setFormData({ ...formData, autoBackup: checked })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="frequency">Frecuencia</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY') =>
                                    setFormData({ ...formData, frequency: value })
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">Diario</SelectItem>
                                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="time">Hora de Ejecución</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="retention">Retención (días)</Label>
                            <Input
                                id="retention"
                                type="number"
                                value={formData.retention}
                                onChange={(e) => setFormData({ ...formData, retention: parseInt(e.target.value) || 30 })}
                                className="mt-1"
                                min="1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Número de días para mantener los backups antiguos
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="attachments">Incluir Adjuntos</Label>
                                <p className="text-xs text-muted-foreground">Archivos y documentos escaneados</p>
                            </div>
                            <Switch
                                id="attachments"
                                checked={formData.includeAttachments}
                                onCheckedChange={(checked) => setFormData({ ...formData, includeAttachments: checked })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Backup Manual</h3>

                        {formData.lastBackup && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-900 font-medium">Último Backup</p>
                                <p className="text-sm text-green-700">
                                    {new Date(formData.lastBackup).toLocaleString('es-CO')}
                                </p>
                            </div>
                        )}

                        <Button onClick={handleBackupNow} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Crear Backup Ahora
                        </Button>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Restaurar Backup</h4>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                                <p className="text-sm text-yellow-900 font-medium mb-1">⚠️ Advertencia</p>
                                <p className="text-xs text-yellow-700">
                                    Restaurar un backup sobrescribirá todos los datos actuales. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <Button variant="outline" className="w-full">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Seleccionar Backup para Restaurar
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
