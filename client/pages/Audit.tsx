import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { AuditEvent, AuditFilters } from "@/types/audit";
import { auditLogger } from "@/utils/auditLogger";
import { MOCK_AUDIT_EVENTS } from "@/data/mockAuditData";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { AuditFiltersPanel } from "@/components/audit/AuditFiltersPanel";

export default function Audit() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial mock data
  useEffect(() => {
    // Initialize with mock data if none exists
    const stored = auditLogger.queryEvents();
    if (stored.length === 0) {
      // Load mock events
      MOCK_AUDIT_EVENTS.forEach(event => {
        localStorage.setItem('audit_events', JSON.stringify(MOCK_AUDIT_EVENTS));
      });
    }
    loadEvents();
  }, []);

  const loadEvents = () => {
    setIsLoading(true);
    const queriedEvents = auditLogger.queryEvents(filters);
    setEvents(queriedEvents);
    setIsLoading(false);
  };

  const handleApplyFilters = (newFilters: AuditFilters) => {
    setFilters(newFilters);
    const queriedEvents = auditLogger.queryEvents(newFilters);
    setEvents(queriedEvents);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    loadEvents();
  };

  // Calculate stats
  const last24hEvents = events.filter(e => {
    const now = new Date();
    const eventTime = new Date(e.timestamp);
    const hoursDiff = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  });

  const criticalEvents = events.filter(e => e.severity === 'CRITICAL');
  const uniqueUsers = new Set(events.map(e => e.userId)).size;

  const hasActiveFilters =
    filters.dateRange ||
    (filters.userIds && filters.userIds.length > 0) ||
    (filters.eventTypes && filters.eventTypes.length > 0) ||
    (filters.modules && filters.modules.length > 0) ||
    (filters.severity && filters.severity.length > 0) ||
    filters.searchTerm;

  return (
    <AppLayout pageTitle="Auditoría">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Auditoría
            </h1>
            <p className="text-muted-foreground mt-2">
              Registro completo de actividad y trazabilidad del sistema contable
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Filtros'}
              {hasActiveFilters && (
                <Badge className="ml-2 bg-primary text-white">
                  ●
                </Badge>
              )}
            </Button>
            <Button variant="outline" onClick={loadEvents}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Eventos</p>
                <p className="text-2xl font-bold mt-1">{events.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Últimas 24 Horas</p>
                <p className="text-2xl font-bold mt-1">{last24hEvents.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos Críticos</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{criticalEvents.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold mt-1">{uniqueUsers}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <AuditFiltersPanel
            filters={filters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Filtros activos aplicados
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </Card>
        )}

        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Timeline de Eventos</h2>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando eventos...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'No se encontraron eventos con los filtros aplicados'
                  : 'No hay eventos de auditoría registrados'}
              </p>
            </div>
          ) : (
            <AuditTimeline events={events} />
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
