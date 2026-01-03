import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Account {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  balance: number;
  active: boolean;
  children?: Account[];
}

// Mock data
const MOCK_ACCOUNTS: Account[] = [
  {
    id: "1",
    code: "1000",
    name: "Activos",
    type: "ASSET",
    balance: 250000,
    active: true,
    children: [
      {
        id: "1.1",
        code: "1100",
        name: "Activos Corrientes",
        type: "ASSET",
        balance: 150000,
        active: true,
        children: [
          {
            id: "1.1.1",
            code: "1110",
            name: "Caja",
            type: "ASSET",
            balance: 50000,
            active: true,
          },
          {
            id: "1.1.2",
            code: "1120",
            name: "Bancos",
            type: "ASSET",
            balance: 100000,
            active: true,
          },
        ],
      },
      {
        id: "1.2",
        code: "1200",
        name: "Activos Fijos",
        type: "ASSET",
        balance: 100000,
        active: true,
      },
    ],
  },
  {
    id: "2",
    code: "2000",
    name: "Pasivos",
    type: "LIABILITY",
    balance: 80000,
    active: true,
    children: [
      {
        id: "2.1",
        code: "2100",
        name: "Pasivos Corrientes",
        type: "LIABILITY",
        balance: 80000,
        active: true,
      },
    ],
  },
  {
    id: "3",
    code: "3000",
    name: "Patrimonio",
    type: "EQUITY",
    balance: 170000,
    active: true,
  },
  {
    id: "4",
    code: "4000",
    name: "Ingresos",
    type: "REVENUE",
    balance: 450000,
    active: true,
  },
  {
    id: "5",
    code: "5000",
    name: "Gastos",
    type: "EXPENSE",
    balance: 120000,
    active: true,
  },
];

function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ASSET: "Activo",
    LIABILITY: "Pasivo",
    EQUITY: "Patrimonio",
    REVENUE: "Ingreso",
    EXPENSE: "Gasto",
  };
  return labels[type] || type;
}

function getAccountTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ASSET: "bg-blue-100 text-blue-800",
    LIABILITY: "bg-red-100 text-red-800",
    EQUITY: "bg-green-100 text-green-800",
    REVENUE: "bg-emerald-100 text-emerald-800",
    EXPENSE: "bg-orange-100 text-orange-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

interface AccountRowProps {
  account: Account;
  level: number;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

function AccountRow({ account, level, onEdit, onDelete }: AccountRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <>
      <tr className="border-b hover:bg-muted/50 transition-colors">
        <td className="p-4">
          <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-muted rounded"
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <span className="font-mono font-semibold text-sm">{account.code}</span>
          </div>
        </td>
        <td className="p-4">
          <span className="font-medium">{account.name}</span>
        </td>
        <td className="p-4">
          <Badge className={getAccountTypeColor(account.type)}>
            {getAccountTypeLabel(account.type)}
          </Badge>
        </td>
        <td className="p-4 text-right">
          <span className="font-mono">
            ${account.balance.toLocaleString("es-CO")}
          </span>
        </td>
        <td className="p-4">
          <Badge variant={account.active ? "default" : "secondary"}>
            {account.active ? "Activa" : "Inactiva"}
          </Badge>
        </td>
        <td className="p-4">
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(account)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(account.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
      {expanded && hasChildren && (
        <>
          {account.children!.map((child) => (
            <AccountRow
              key={child.id}
              account={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}
    </>
  );
}

interface CreateAccountDialogProps {
  onSave: (account: Omit<Account, "id" | "balance" | "children">) => void;
}

function CreateAccountDialog({ onSave }: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "ASSET" as Account["type"],
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ code: "", name: "", type: "ASSET", active: true });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuenta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta</DialogTitle>
          <DialogDescription>
            Añade una nueva cuenta al plan de cuentas
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Código de Cuenta</Label>
            <Input
              id="code"
              placeholder="Ej: 1110"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Nombre de Cuenta</Label>
            <Input
              id="name"
              placeholder="Ej: Caja General"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo de Cuenta</Label>
            <Select value={formData.type} onValueChange={(value) =>
              setFormData({ ...formData, type: value as Account["type"] })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASSET">Activo</SelectItem>
                <SelectItem value="LIABILITY">Pasivo</SelectItem>
                <SelectItem value="EQUITY">Patrimonio</SelectItem>
                <SelectItem value="REVENUE">Ingreso</SelectItem>
                <SelectItem value="EXPENSE">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Crear Cuenta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.code.includes(searchTerm) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || account.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddAccount = (newAccount: Omit<Account, "id" | "balance" | "children">) => {
    const account: Account = {
      ...newAccount,
      id: Math.random().toString(),
      balance: 0,
    };
    setAccounts([...accounts, account]);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cuenta?")) {
      setAccounts(accounts.filter((a) => a.id !== accountId));
    }
  };

  return (
    <AppLayout pageTitle="Plan de Cuentas">
      <div className="p-6 space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h2 className="text-2xl font-bold">Plan de Cuentas (PUC)</h2>
          <CreateAccountDialog onSave={handleAddAccount} />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="ASSET">Activos</SelectItem>
                <SelectItem value="LIABILITY">Pasivos</SelectItem>
                <SelectItem value="EQUITY">Patrimonio</SelectItem>
                <SelectItem value="REVENUE">Ingresos</SelectItem>
                <SelectItem value="EXPENSE">Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Accounts Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-semibold">Código</th>
                  <th className="p-4 text-left font-semibold">Nombre</th>
                  <th className="p-4 text-left font-semibold">Tipo</th>
                  <th className="p-4 text-right font-semibold">Balance</th>
                  <th className="p-4 text-left font-semibold">Estado</th>
                  <th className="p-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    level={0}
                    onEdit={setSelectedAccount}
                    onDelete={handleDeleteAccount}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Activos</p>
              <p className="text-xl font-bold">$250,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pasivos</p>
              <p className="text-xl font-bold">$80,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patrimonio</p>
              <p className="text-xl font-bold">$170,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ingresos</p>
              <p className="text-xl font-bold text-green-600">$450,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gastos</p>
              <p className="text-xl font-bold text-orange-600">$120,000</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
