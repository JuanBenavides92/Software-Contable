import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Circle,
    AlertTriangle,
    Info,
    AlertCircle,
    Eye,
    FileText,
} from "lucide-react";
import { useState } from "react";
import type { AuditEvent } from "@/types/audit";
import { AUDIT_EVENT_LABELS, AUDIT_MODULE_LABELS } from "@/types/audit";

interface AuditTimelineProps {
    events: AuditEvent[];
}

export function AuditTimeline({ events }: AuditTimelineProps) {
    const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const getSeverityIcon = (severity: AuditEvent['severity']) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'INFO':
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getSeverityBadge = (severity: AuditEvent['severity']) => {
        switch (severity) {
            case 'CRITICAL':
                return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
            case 'WARNING':
                return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
            case 'INFO':
                return <Badge className="bg-blue-100 text-blue-800">Información</Badge>;
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        return new Date(timestamp).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleViewDetails = (event: AuditEvent) => {
        setSelectedEvent(event);
        setShowDetails(true);
    };

    return (
        <>
            <div className="space-y-4">
                {events.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${event.severity === 'CRITICAL' ? 'bg-red-100' :
                                event.severity === 'WARNING' ? 'bg-yellow-100' :
                                    'bg-blue-100'
                                }`}>
                                {getSeverityIcon(event.severity)}
                            </div>
                            {index < events.length - 1 && (
                                <div className="w-0.5 flex-1 min-h-[60px] bg-gray-200 mt-2" />
                            )}
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 pb-8">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {formatTimestamp(event.timestamp)}
                                    </span>
                                    {getSeverityBadge(event.severity)}
                                    <Badge variant="outline" className="text-xs">
                                        {AUDIT_MODULE_LABELS[event.module]}
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base mb-1">
                                            {AUDIT_EVENT_LABELS[event.eventType]}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            <span className="font-medium">{event.userName}</span>
                                            {event.userRole && ` (${event.userRole})`} - {event.action}
                                        </p>

                                        {event.entityName && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <FileText className="w-4 h-4" />
                                                <span>{event.entityName}</span>
                                            </div>
                                        )}

                                        {event.notes && (
                                            <p className="text-sm text-gray-600 italic mt-2">
                                                "{event.notes}"
                                            </p>
                                        )}

                                        {event.changes && event.changes.length > 0 && (
                                            <div className="mt-2 text-sm">
                                                <span className="font-medium text-gray-700">Cambios:</span>
                                                <ul className="list-disc list-inside ml-2 mt-1 text-muted-foreground">
                                                    {event.changes.slice(0, 2).map((change, idx) => (
                                                        <li key={idx}>
                                                            {change.fieldLabel}: <span className="line-through">{String(change.oldValue)}</span> → <span className="font-medium">{String(change.newValue)}</span>
                                                        </li>
                                                    ))}
                                                    {event.changes.length > 2 && (
                                                        <li className="text-primary">
                                                            +{event.changes.length - 2} cambios más
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {event.ipAddress && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                IP: {event.ipAddress}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(event)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Ver Detalles
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Event Details Dialog */}
            {selectedEvent && (
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {getSeverityIcon(selectedEvent.severity)}
                                {AUDIT_EVENT_LABELS[selectedEvent.eventType]}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* General Information */}
                            <div>
                                <h3 className="font-semibold mb-3">Información General</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Fecha/Hora:</span>
                                        <p className="font-medium">{formatTimestamp(selectedEvent.timestamp)}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Usuario:</span>
                                        <p className="font-medium">
                                            {selectedEvent.userName}
                                            {selectedEvent.userRole && ` (${selectedEvent.userRole})`}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Módulo:</span>
                                        <p className="font-medium">{AUDIT_MODULE_LABELS[selectedEvent.module]}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Severidad:</span>
                                        <p>{getSeverityBadge(selectedEvent.severity)}</p>
                                    </div>
                                    {selectedEvent.ipAddress && (
                                        <div>
                                            <span className="text-muted-foreground">Dirección IP:</span>
                                            <p className="font-medium font-mono">{selectedEvent.ipAddress}</p>
                                        </div>
                                    )}
                                    {selectedEvent.userAgent && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Navegador:</span>
                                            <p className="font-medium text-xs">{selectedEvent.userAgent}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Entity Information */}
                            {selectedEvent.entityName && (
                                <div>
                                    <h3 className="font-semibold mb-3">Entidad Afectada</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedEvent.entityType && (
                                                <div>
                                                    <span className="text-muted-foreground">Tipo:</span>
                                                    <p className="font-medium">{selectedEvent.entityType}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-muted-foreground">Identificador:</span>
                                                <p className="font-medium">{selectedEvent.entityName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Changes */}
                            {selectedEvent.changes && selectedEvent.changes.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Cambios Realizados</h3>
                                    <div className="space-y-3">
                                        {selectedEvent.changes.map((change, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                                <p className="font-medium text-sm mb-2">{change.fieldLabel}</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Antes:</span>
                                                        <p className="font-mono bg-white px-2 py-1 rounded mt-1">
                                                            {String(change.oldValue)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Después:</span>
                                                        <p className="font-mono bg-white px-2 py-1 rounded mt-1">
                                                            {String(change.newValue)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedEvent.notes && (
                                <div>
                                    <h3 className="font-semibold mb-3">Notas</h3>
                                    <p className="text-sm bg-gray-50 rounded-lg p-4 italic">
                                        "{selectedEvent.notes}"
                                    </p>
                                </div>
                            )}

                            {/* Metadata */}
                            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Información Adicional</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <pre className="text-xs overflow-x-auto">
                                            {JSON.stringify(selectedEvent.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
