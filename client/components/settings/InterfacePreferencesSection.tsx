import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, Save, Sun, Moon } from "lucide-react";
import { useState } from "react";
import type { InterfacePreferences } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

interface InterfacePreferencesSectionProps {
    prefs: InterfacePreferences;
    onUpdate: (prefs: InterfacePreferences) => void;
}

export function InterfacePreferencesSection({ prefs, onUpdate }: InterfacePreferencesSectionProps) {
    const [formData, setFormData] = useState<InterfacePreferences>(prefs);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdate(formData);
        toast({
            title: "✅ Preferencias Guardadas",
            description: "Las preferencias de interfaz se han actualizado correctamente.",
        });
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Preferencias de Interfaz</h2>
                </div>
                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold">Apariencia</h3>

                    <div>
                        <Label htmlFor="theme">Tema</Label>
                        <Select
                            value={formData.theme}
                            onValueChange={(value: 'LIGHT' | 'DARK' | 'AUTO') =>
                                setFormData({ ...formData, theme: value })
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LIGHT">
                                    <div className="flex items-center gap-2">
                                        <Sun className="w-4 h-4" />
                                        Claro
                                    </div>
                                </SelectItem>
                                <SelectItem value="DARK">
                                    <div className="flex items-center gap-2">
                                        <Moon className="w-4 h-4" />
                                        Oscuro
                                    </div>
                                </SelectItem>
                                <SelectItem value="AUTO">Automático (Sistema)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="fontSize">Tamaño de Fuente</Label>
                        <Select
                            value={formData.fontSize}
                            onValueChange={(value: 'SMALL' | 'MEDIUM' | 'LARGE') =>
                                setFormData({ ...formData, fontSize: value })
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SMALL">Pequeño</SelectItem>
                                <SelectItem value="MEDIUM">Mediano</SelectItem>
                                <SelectItem value="LARGE">Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="dateFormat">Formato de Fecha</Label>
                        <Select
                            value={formData.dateFormat}
                            onValueChange={(value: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY') =>
                                setFormData({ ...formData, dateFormat: value })
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Ej: 03/01/2025)</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (Ej: 2025-01-03)</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (Ej: 01/03/2025)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="timeFormat">Formato de Hora</Label>
                        <Select
                            value={formData.timeFormat}
                            onValueChange={(value: '12h' | '24h') =>
                                setFormData({ ...formData, timeFormat: value })
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="12h">12 horas (Ej: 3:30 PM)</SelectItem>
                                <SelectItem value="24h">24 horas (Ej: 15:30)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold">Notificaciones</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-enable">Activar Notificaciones</Label>
                                <p className="text-xs text-muted-foreground">Mostrar notificaciones del sistema</p>
                            </div>
                            <Switch
                                id="notif-enable"
                                checked={formData.enableNotifications}
                                onCheckedChange={(checked) => setFormData({ ...formData, enableNotifications: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-sound">Sonidos de Notificación</Label>
                                <p className="text-xs text-muted-foreground">Reproducir sonido al notificar</p>
                            </div>
                            <Switch
                                id="notif-sound"
                                checked={formData.enableSounds}
                                onCheckedChange={(checked) => setFormData({ ...formData, enableSounds: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-critical">Notificar Eventos Críticos</Label>
                                <p className="text-xs text-muted-foreground">Alertas de reversiones y cierres</p>
                            </div>
                            <Switch
                                id="notif-critical"
                                checked={formData.notifyCriticalEvents}
                                onCheckedChange={(checked) => setFormData({ ...formData, notifyCriticalEvents: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="daily-email">Resumen Diario por Email</Label>
                                <p className="text-xs text-muted-foreground">Recibir email con actividad diaria</p>
                            </div>
                            <Switch
                                id="daily-email"
                                checked={formData.dailySummaryEmail}
                                onCheckedChange={(checked) => setFormData({ ...formData, dailySummaryEmail: checked })}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Dashboard</h4>
                        <div>
                            <Label htmlFor="report-period">Período por Defecto en Reportes</Label>
                            <Select
                                value={formData.defaultReportPeriod}
                                onValueChange={(value: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'CUSTOM') =>
                                    setFormData({ ...formData, defaultReportPeriod: value })
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT_MONTH">Mes Actual</SelectItem>
                                    <SelectItem value="CURRENT_YEAR">Año Actual</SelectItem>
                                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
