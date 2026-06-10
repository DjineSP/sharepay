"use client";

import { useState, useCallback } from "react";
import { AdminPageHeading } from "@/components/admin/overview/admin-page-heading";
import { useMerchants } from "@/features/admin/merchants/hooks/use-merchants";
import { adminMerchantsService } from "@/features/admin/merchants/services/merchants.service";
import { AccountStatus, KycLevel, MerchantSummaryResponse } from "@/features/admin/merchants/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const STATUS_LABELS: Record<AccountStatus, string> = {
    ACTIVE: "Actif",
    INACTIVE: "Inactif",
    SUSPENDED: "Suspendu",
    DELETED: "Supprimé",
};

const KYC_LABELS: Record<KycLevel, string> = {
    NONE: "Aucun",
    BASIC: "Basique",
    ADVANCED: "Avancé",
    FULL: "Complet",
};

const statusVariant = (s: AccountStatus) =>
    s === "ACTIVE" ? "default" : s === "SUSPENDED" ? "destructive" : "secondary";

const kycVariant = (k: KycLevel) =>
    k === "FULL" ? "default" : k === "ADVANCED" ? "secondary" : "outline";

export default function AdminMerchantsPage() {
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<AccountStatus | undefined>(undefined);
    const { data, loading, error, refetch } = useMerchants(page, 20, statusFilter);

    const [actionTarget, setActionTarget] = useState<MerchantSummaryResponse | null>(null);
    const [actionType, setActionType] = useState<"status" | "kyc" | null>(null);
    const [newStatus, setNewStatus] = useState<AccountStatus>("ACTIVE");
    const [newKyc, setNewKyc] = useState<KycLevel>("BASIC");
    const [submitting, setSubmitting] = useState(false);

    const openStatusDialog = (merchant: MerchantSummaryResponse) => {
        setActionTarget(merchant);
        setNewStatus(merchant.status);
        setActionType("status");
    };

    const openKycDialog = (merchant: MerchantSummaryResponse) => {
        setActionTarget(merchant);
        setNewKyc(merchant.kycLevel);
        setActionType("kyc");
    };

    const closeDialog = () => {
        setActionTarget(null);
        setActionType(null);
    };

    const handleConfirm = useCallback(async () => {
        if (!actionTarget) return;
        setSubmitting(true);
        try {
            if (actionType === "status") {
                await adminMerchantsService.updateStatus(actionTarget.id, { status: newStatus });
                toast.success("Statut mis à jour");
            } else {
                await adminMerchantsService.updateKyc(actionTarget.id, { kycLevel: newKyc });
                toast.success("Niveau KYC mis à jour");
            }
            closeDialog();
            refetch(page, statusFilter);
        } catch {
            toast.error("Une erreur est survenue");
        } finally {
            setSubmitting(false);
        }
    }, [actionTarget, actionType, newStatus, newKyc, page, statusFilter, refetch]);

    return (
        <div className="space-y-6">
            <AdminPageHeading
                title="Gestion des Marchands"
                subtitle="Consultez, filtrez et gérez les comptes marchands"
            />

            <div className="flex items-center justify-between gap-4">
                <Select
                    value={statusFilter ?? "ALL"}
                    onValueChange={(v) => {
                        setPage(0);
                        setStatusFilter(v === "ALL" ? undefined : v as AccountStatus);
                    }}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                        {(Object.keys(STATUS_LABELS) as AccountStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => refetch(page, statusFilter)}>
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
                            <TableHead>Pays</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>KYC</TableHead>
                            <TableHead>Email vérifié</TableHead>
                            <TableHead>Créé le</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 8 }).map((__, j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-destructive py-10">
                                    Erreur lors du chargement des marchands
                                </TableCell>
                            </TableRow>
                        ) : !data?.content.length ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                                    Aucun marchand trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.content.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="font-medium">{m.fullName}</TableCell>
                                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                                    <TableCell>{m.country}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(m.status)}>{STATUS_LABELS[m.status]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={kycVariant(m.kycLevel)}>{KYC_LABELS[m.kycLevel]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {m.emailVerified
                                            ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            : <span className="text-muted-foreground text-xs">Non</span>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openStatusDialog(m)}>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Changer le statut
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openKycDialog(m)}>
                                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                                    Changer le KYC
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
                        {data.totalElements} marchand{data.totalElements > 1 ? "s" : ""} - Page {data.page + 1} / {data.totalPages}
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

            {/* Status dialog */}
            <Dialog open={actionType === "status"} onOpenChange={(o) => !o && closeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le statut de {actionTarget?.fullName}</DialogTitle>
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
                        <Button variant="outline" onClick={closeDialog}>Annuler</Button>
                        <Button onClick={handleConfirm} disabled={submitting}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* KYC dialog */}
            <Dialog open={actionType === "kyc"} onOpenChange={(o) => !o && closeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le KYC de {actionTarget?.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newKyc} onValueChange={(v) => setNewKyc(v as KycLevel)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(KYC_LABELS) as KycLevel[]).map((k) => (
                                    <SelectItem key={k} value={k}>{KYC_LABELS[k]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>Annuler</Button>
                        <Button onClick={handleConfirm} disabled={submitting}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
