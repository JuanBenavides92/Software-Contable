import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users as UsersIcon, Plus, UserCog, Trash2 } from "lucide-react";
import type { User } from "@/types/settings";
import { USER_ROLE_LABELS } from "@/types/settings";

interface UserManagementSectionProps {
    users: User[];
    onUpdate: (users: User[]) => void;
}

export function UserManagementSection({ users, onUpdate }: UserManagementSectionProps) {
    const getRoleBadge = (role: User['role']) => {
        const colors = {
            ADMIN: 'bg-purple-100 text-purple-800',
            ACCOUNTANT: 'bg-blue-100 text-blue-800',
            ASSISTANT: 'bg-green-100 text-green-800',
            AUDITOR: 'bg-yellow-100 text-yellow-800',
        };
        return <Badge className={colors[role]}>{USER_ROLE_LABELS[role]}</Badge>;
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre Completo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Último Acceso</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="font-mono text-sm">{user.username}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                                {user.isActive ? (
                                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                                ) : (
                                    <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {user.lastLogin
                                    ? new Date(user.lastLogin).toLocaleString('es-CO', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : 'Nunca'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm">
                                        <UserCog className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" disabled={user.role === 'ADMIN'}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                    <strong>Roles disponibles:</strong> Administrador (acceso total), Contador (crear y contabilizar),
                    Asistente (solo crear borradores), Auditor (solo visualización y auditoría).
                </p>
            </div>
        </Card>
    );
}
