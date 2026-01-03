import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Plus, Download, Eye, MoreVertical, AlertCircle } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for charts
const monthlyData = [
  { month: "Ene", ingresos: 45000, gastos: 28000 },
  { month: "Feb", ingresos: 52000, gastos: 32000 },
  { month: "Mar", ingresos: 48000, gastos: 29000 },
  { month: "Abr", ingresos: 61000, gastos: 35000 },
  { month: "May", ingresos: 55000, gastos: 31000 },
  { month: "Jun", ingresos: 67000, gastos: 38000 },
];

const categoryData = [
  { name: "Ventas", value: 45 },
  { name: "Servicios", value: 30 },
  { name: "Otros", value: 25 },
];

const COLORS = ["#1B3A6E", "#0891B2", "#64748B"];

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 group-hover:text-primary transition-colors">{value}</p>
          <div className="flex items-center gap-1 mt-3">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-500" />
            )}
            <span
              className={`text-sm font-semibold ${trend === "up" ? "text-emerald-600" : "text-orange-600"
                }`}
            >
              {change}% vs mes anterior
            </span>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl text-primary group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const [period, setPeriod] = useState("current");

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="p-6 space-y-6">
        {/* Welcome Section with Actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Bienvenido, {user?.name || user?.email?.split("@")[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{currentCompany?.name}</span> • {currentCompany?.type === "JURIDICAL" ? "Empresa Jurídica" : "Persona Natural"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Asiento
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ingresos del Mes"
            value="$67,000"
            change={15}
            icon={<DollarSign className="w-6 h-6" />}
            trend="up"
          />
          <StatsCard
            title="Gastos del Mes"
            value="$38,000"
            change={8}
            icon={<AlertCircle className="w-6 h-6" />}
            trend="down"
          />
          <StatsCard
            title="Balance Neto"
            value="$29,000"
            change={22}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="up"
          />
          <StatsCard
            title="Cuentas por Cobrar"
            value="$12,500"
            change={3}
            icon={<Users className="w-6 h-6" />}
            trend="down"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses Chart */}
          <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-white to-muted/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-lg">Ingresos vs Gastos</h2>
                <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Descargar</DropdownMenuItem>
                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#1B3A6E"
                  strokeWidth={3}
                  name="Ingresos"
                  dot={{ fill: "#1B3A6E", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  stroke="#0891B2"
                  strokeWidth={3}
                  name="Gastos"
                  dot={{ fill: "#0891B2", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Distribution */}
          <Card className="p-6 bg-gradient-to-br from-white to-muted/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">Distribución</h2>
                <p className="text-xs text-muted-foreground mt-1">Por categoría</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6 bg-gradient-to-br from-white to-muted/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-lg">Últimas Transacciones</h2>
              <p className="text-xs text-muted-foreground mt-1">Movimientos recientes</p>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver todas
            </Button>
          </div>
          <div className="space-y-2">
            {[
              { date: "2024-01-15", description: "Venta a Cliente ABC", amount: 5000, type: "ingreso" },
              { date: "2024-01-14", description: "Compra de Inventario", amount: -2500, type: "gasto" },
              { date: "2024-01-13", description: "Servicios Profesionales", amount: 3000, type: "ingreso" },
              { date: "2024-01-12", description: "Pago de Servicios", amount: -1200, type: "gasto" },
              { date: "2024-01-11", description: "Pago de Nómina", amount: -8000, type: "gasto" },
            ].map((transaction, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/60 transition-all duration-200 group cursor-pointer border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${transaction.amount > 0 ? "bg-emerald-100" : "bg-orange-100"}`}>
                    <CreditCard className={`w-4 h-4 ${transaction.amount > 0 ? "text-emerald-600" : "text-orange-600"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <p
                  className={`font-bold text-sm font-mono ${transaction.amount > 0 ? "text-emerald-600" : "text-orange-600"
                    }`}
                >
                  {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
