export interface NavItem {
  title: string;
  path: string;
  iconName: string;
  children?: NavItem[];
  badge?: string;
  description?: string;
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    iconName: "BarChart3",
    description: "Vista general y métricas principales",
  },
  {
    title: "Plan de Cuentas",
    path: "/chart-of-accounts",
    iconName: "BookOpen",
    description: "Gestión de cuentas contables (PUC)",
  },
  {
    title: "Asientos Contables",
    path: "/journal-entries",
    iconName: "FileText",
    description: "Registro de transacciones contables",
  },
  {
    title: "Reportes Contables",
    path: "/reports",
    iconName: "TrendingUp",
    description: "Reportes financieros y DIAN",
  },
  {
    title: "Certificados Tributarios",
    path: "/tax-certificates",
    iconName: "CheckCircle2",
    description: "RUT y certificados de retención",
  },
  {
    title: "Exportaciones",
    path: "/exports",
    iconName: "FileText",
    description: "Exportar datos a Excel, XML, DIAN",
  },
  {
    title: "Conciliación Bancaria",
    path: "/bank-reconciliation",
    iconName: "CreditCard",
    description: "Reconciliación de movimientos bancarios",
  },
  {
    title: "Auditoría",
    path: "/audit",
    iconName: "Shield",
    description: "Registro de auditoría y trazabilidad",
  },
  {
    title: "Asistente IA",
    path: "/ai-assistant",
    iconName: "Zap",
    description: "Categorización automática y análisis",
  },
  {
    title: "Configuración",
    path: "/settings",
    iconName: "Settings",
    description: "Roles, usuarios y preferencias",
  },
];
