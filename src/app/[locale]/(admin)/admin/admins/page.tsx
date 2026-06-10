"use client";

import { useState, useCallback } from "react";
import { AdminPageHeading } from "@/components/admin/overview/admin-page-heading";
import { useStaff } from "@/features/admin/staff/hooks/use-staff";
import { adminStaffService } from "@/features/admin/staff/services/staff.service";
import { AccountStatus, StaffResponse } from "@/features/admin/staff/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, UserPlus, RefreshCw, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

const STATUS_LABELS: Record<AccountStatus, string> = {
    ACTIVE: "Actif",
    INACTIVE: "Inactif",
    SUSPENDED: "Suspendu",
    DELETED: "Supprimé",
};

const statusVariant = (s: AccountStatus) =>
    s === "ACTIVE" ? "default" : s === "SUSPENDED" ? "destructive" : "secondary";

export default function AdminAdminsPage() {
    const [page, setPage] = useState(0);
    const { data, loading, error, refetch } = useStaff("ADMIN", page, 20);

    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });

    const [statusTarget, setStatusTarget] = useState<StaffResponse | null>(null);
    const [newStatus, setNewStatus] = useState<AccountStatus>("ACTIVE");
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await adminStaffService.create({ ...form, role: "ADMIN" });
            toast.success("Administrateur créé");
            setShowCreate(false);
            setForm({ fullName: "", email: "", password: "", phone: "" });
            refetch(page);
        } catch {
            toast.error("Erreur lors de la création");
        } finally {
            setCreating(false);
        }
    }, [form, page, refetch]);

    const handleStatusChange = useCallback(async () => {
        if (!statusTarget) return;
        setSubmitting(true);
        try {
            await adminStaffService.updateStatus(statusTarget.id, { status: newStatus });
            toast.success("Statut mis à jour");
            setStatusTarget(null);
            refetch(page);
        } catch {
            toast.error("Une erreur est survenue");
        } finally {
            setSubmitting(false);
        }
    }, [statusTarget, newStatus, page, refetch]);

    const handleDelete = useCallback(async (admin: StaffResponse) => {
        if (!confirm(`Supprimer ${admin.fullName} ?`)) return;
        try {
            await adminStaffService.delete(admin.id);
            toast.success("Administrateur supprimé");
            refetch(page);
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    }, [page, refetch]);

    return (
        <div className="space-y-6">
            <AdminPageHeading
                title="Administrateurs"
                subtitle="Gérez les comptes administrateurs de la plateforme"
                action={
                    <Button onClick={() => setShowCreate(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Nouvel admin
                    </Button>
                }
            />

            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => refetch(page)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Créé le</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-destructive py-10">
                                    Erreur lors du chargement
                                </TableCell>
                            </TableRow>
                        ) : !data?.content.length ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                    Aucun administrateur
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.content.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">{admin.fullName}</TableCell>
                                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{admin.phone ?? "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(admin.status)}>{STATUS_LABELS[admin.status]}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(admin.createdAt).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setStatusTarget(admin);
                                                    setNewStatus(admin.status);
                                                }}>
                                                    Changer le statut
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={() => handleDelete(admin)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {data.totalElements} admin{data.totalElements > 1 ? "s" : ""} - Page {data.page + 1} / {data.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            Précédent
                        </Button>
                        <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage(p => p + 1)}>
                            Suivant
                        </Button>
                    </div>
                </div>
            )}

            {/* Create dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un administrateur</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nom complet</Label>
                            <Input
                                id="fullName"
                                value={form.fullName}
                                onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <PasswordInput
                                id="password"
                                value={form.password}
                                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={creating}>Créer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Status dialog */}
            <Dialog open={!!statusTarget} onOpenChange={(o) => !o && setStatusTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le statut de {statusTarget?.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as AccountStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(STATUS_LABELS) as AccountStatus[]).map((s) => (
                                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusTarget(null)}>Annuler</Button>
                        <Button onClick={handleStatusChange} disabled={submitting}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
