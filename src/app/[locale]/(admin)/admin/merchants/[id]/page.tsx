"use client";

import { use, useMemo, useState, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import {
    ArrowLeft, RefreshCw, MoreHorizontal, CheckCircle2, ShieldCheck,
    Wallet, TrendingUp, TrendingDown, Percent, Mail, Phone, Calendar, Globe, Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { useMerchantOverview } from "@/features/admin/merchants/hooks/use-merchant-overview";
import { adminMerchantsService } from "@/features/admin/merchants/services/merchants.service";
import {
    AccountStatus, KycLevel, TransactionStatus,
    TransactionStats, Merchant360TransactionIn, Merchant360Payout,
} from "@/features/admin/merchants/types";
import {
    STATUS_LABELS, KYC_LABELS, TX_STATUS_LABELS, TX_TYPE_LABELS,
    statusVariant, kycVariant, txStatusVariant,
} from "@/features/admin/merchants/labels";
import { formatAmount } from "@/lib/utils";

const money = (n: number, currency = "XAF") => formatAmount(n, currency);
const dateShort = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");
const dateLong = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "M";

const TX_STATUSES: TransactionStatus[] = ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"];

function successRate(stats: TransactionStats): number | null {
    if (stats.totalCount === 0) return null;
    return Math.round((stats.byStatus.SUCCESS.count / stats.totalCount) * 1000) / 10;
}

// ---------------------------------------------------------------- KPI card

function KpiCard({
    label, value, sub, icon: Icon, accent,
}: {
    label: string; value: string; sub?: string;
    icon: React.ElementType; accent?: string;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                    </div>
                    <div className={`shrink-0 rounded-lg p-2 ${accent ?? "bg-primary/10 text-primary"}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// -------------------------------------------------- Breakdown by status

function StatusBreakdown({ title, stats }: { title: string; stats: TransactionStats }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Nombre</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {TX_STATUSES.map((s) => (
                            <TableRow key={s}>
                                <TableCell>
                                    <Badge variant={txStatusVariant(s)}>{TX_STATUS_LABELS[s]}</Badge>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">{stats.byStatus[s].count}</TableCell>
                                <TableCell className="text-right tabular-nums">{money(stats.byStatus[s].sumAmount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ------------------------------------------------ status filter helper

function StatusFilter({
    value, onChange,
}: { value: TransactionStatus | "ALL"; onChange: (v: TransactionStatus | "ALL") => void }) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as TransactionStatus | "ALL")}>
            <SelectTrigger className="w-44">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                {TX_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{TX_STATUS_LABELS[s]}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// Ordre de tri par statut (regroupement) puis date décroissante.
const statusOrder: Record<TransactionStatus, number> = {
    SUCCESS: 0, PENDING: 1, FAILED: 2, CANCELLED: 3, REFUNDED: 4,
};

function TransactionsTab({ rows }: { rows: Merchant360TransactionIn[] }) {
    const [filter, setFilter] = useState<TransactionStatus | "ALL">("ALL");
    const view = useMemo(() => {
        const filtered = filter === "ALL" ? rows : rows.filter((r) => r.status === filter);
        return [...filtered].sort((a, b) =>
            statusOrder[a.status] - statusOrder[b.status] ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [rows, filter]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <StatusFilter value={filter} onChange={setFilter} />
                <span className="text-sm text-muted-foreground">{view.length} transaction{view.length > 1 ? "s" : ""}</span>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead>Payeur</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {view.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                    Aucune transaction
                                </TableCell>
                            </TableRow>
                        ) : view.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                                <TableCell className="text-xs">{TX_TYPE_LABELS[t.type]}</TableCell>
                                <TableCell><Badge variant={txStatusVariant(t.status)}>{TX_STATUS_LABELS[t.status]}</Badge></TableCell>
                                <TableCell className="text-right tabular-nums">{money(t.amount, t.currency)}</TableCell>
                                <TableCell className="text-xs">{t.customerName ?? t.payerAccount ?? "—"}</TableCell>
                                <TableCell className="text-xs">{t.providerName ?? "—"}</TableCell>
                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{dateShort(t.createdAt)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function PayoutsTab({ rows }: { rows: Merchant360Payout[] }) {
    const [filter, setFilter] = useState<TransactionStatus | "ALL">("ALL");
    const view = useMemo(() => {
        const filtered = filter === "ALL" ? rows : rows.filter((r) => r.status === filter);
        return [...filtered].sort((a, b) =>
            statusOrder[a.status] - statusOrder[b.status] ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [rows, filter]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <StatusFilter value={filter} onChange={setFilter} />
                <span className="text-sm text-muted-foreground">{view.length} payout{view.length > 1 ? "s" : ""}</span>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead>Bénéficiaire</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {view.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                    Aucun payout
                                </TableCell>
                            </TableRow>
                        ) : view.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                                <TableCell><Badge variant={txStatusVariant(p.status)}>{TX_STATUS_LABELS[p.status]}</Badge></TableCell>
                                <TableCell className="text-right tabular-nums">{money(p.amount, p.currency)}</TableCell>
                                <TableCell className="text-xs">{p.beneficiaryName ?? p.beneficiaryAccount ?? "—"}</TableCell>
                                <TableCell className="text-xs">{p.providerName ?? "—"}</TableCell>
                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{dateShort(p.createdAt)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-border/60">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
            <span className="text-sm font-medium break-all">{value}</span>
        </div>
    );
}

// ------------------------------------------------------------- page

export default function AdminMerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data, loading, error, refetch } = useMerchantOverview(id);

    const [dialog, setDialog] = useState<"status" | "kyc" | null>(null);
    const [newStatus, setNewStatus] = useState<AccountStatus>("ACTIVE");
    const [newKyc, setNewKyc] = useState<KycLevel>("BASIC");
    const [submitting, setSubmitting] = useState(false);

    const openStatus = () => { if (data) { setNewStatus(data.status); setDialog("status"); } };
    const openKyc = () => { if (data) { setNewKyc(data.kycLevel); setDialog("kyc"); } };

    const confirm = useCallback(async () => {
        setSubmitting(true);
        try {
            if (dialog === "status") {
                await adminMerchantsService.updateStatus(id, { status: newStatus });
                toast.success("Statut mis à jour");
            } else {
                await adminMerchantsService.updateKyc(id, { kycLevel: newKyc });
                toast.success("Niveau KYC mis à jour");
            }
            setDialog(null);
            refetch();
        } catch {
            toast.error("Une erreur est survenue");
        } finally {
            setSubmitting(false);
        }
    }, [dialog, id, newStatus, newKyc, refetch]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/merchants")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                </Button>
                <div className="rounded-xl border bg-card p-10 text-center text-destructive">
                    Impossible de charger ce marchand.
                </div>
            </div>
        );
    }

    const payInRate = successRate(data.payInStats);
    const primaryBalance = data.balances[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/merchants")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Marchands
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
                </Button>
            </div>

            {/* En-tête marchand */}
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {initials(data.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                        <h1 className="text-xl font-bold truncate">{data.fullName}</h1>
                        <p className="text-sm text-muted-foreground truncate">{data.email}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge variant={statusVariant(data.status)}>{STATUS_LABELS[data.status]}</Badge>
                            <Badge variant={kycVariant(data.kycLevel)}>KYC : {KYC_LABELS[data.kycLevel]}</Badge>
                            <span className="text-xs text-muted-foreground">
                                Inscrit le {dateShort(data.createdAt)}
                            </span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={openStatus}>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Changer le statut
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={openKyc}>
                                <ShieldCheck className="h-4 w-4 mr-2" /> Changer le KYC
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Solde disponible"
                    value={primaryBalance ? money(primaryBalance.availableAmount, primaryBalance.currency) : "—"}
                    sub={primaryBalance ? `En attente : ${money(primaryBalance.pendingAmount, primaryBalance.currency)}` : undefined}
                    icon={Wallet}
                    accent="bg-emerald-500/10 text-emerald-600"
                />
                <KpiCard
                    label="Encaissements réussis"
                    value={money(data.payInStats.totalVolume)}
                    sub={`${data.payInStats.totalCount} transaction${data.payInStats.totalCount > 1 ? "s" : ""}`}
                    icon={TrendingUp}
                />
                <KpiCard
                    label="Payouts réussis"
                    value={money(data.payOutStats.totalVolume)}
                    sub={`${data.payOutStats.totalCount} payout${data.payOutStats.totalCount > 1 ? "s" : ""}`}
                    icon={TrendingDown}
                    accent="bg-amber-500/10 text-amber-600"
                />
                <KpiCard
                    label="Taux de réussite (pay-in)"
                    value={payInRate !== null ? `${payInRate}%` : "—"}
                    sub={payInRate !== null ? `${data.payInStats.byStatus.SUCCESS.count}/${data.payInStats.totalCount} réussies` : "Aucune transaction"}
                    icon={Percent}
                    accent="bg-blue-500/10 text-blue-600"
                />
            </div>

            {/* Onglets */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions ({data.transactionsIn.length})</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts ({data.payouts.length})</TabsTrigger>
                    <TabsTrigger value="info">Infos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <StatusBreakdown title="Encaissements par statut" stats={data.payInStats} />
                        <StatusBreakdown title="Payouts par statut" stats={data.payOutStats} />
                    </div>
                    {data.balances.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Soldes</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Devise</TableHead>
                                            <TableHead className="text-right">Disponible</TableHead>
                                            <TableHead className="text-right">En attente</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.balances.map((b) => (
                                            <TableRow key={b.currency}>
                                                <TableCell className="font-medium">{b.currency}</TableCell>
                                                <TableCell className="text-right tabular-nums">{money(b.availableAmount, b.currency)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{money(b.pendingAmount, b.currency)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="transactions">
                    <TransactionsTab rows={data.transactionsIn} />
                </TabsContent>

                <TabsContent value="payouts">
                    <PayoutsTab rows={data.payouts} />
                </TabsContent>

                <TabsContent value="info">
                    <Card>
                        <CardContent className="p-6">
                            <InfoRow icon={Hash} label="Identifiant" value={data.id} />
                            <InfoRow icon={Mail} label="Email" value={`${data.email}${data.emailVerified ? " (vérifié)" : " (non vérifié)"}`} />
                            <InfoRow icon={Phone} label="Téléphone" value={data.phone ? `${data.phone}${data.phoneVerified ? " (vérifié)" : ""}` : "—"} />
                            <InfoRow icon={Globe} label="Pays" value={data.country ?? "—"} />
                            <InfoRow icon={ShieldCheck} label="Niveau KYC" value={KYC_LABELS[data.kycLevel]} />
                            <InfoRow icon={CheckCircle2} label="Statut" value={STATUS_LABELS[data.status]} />
                            <InfoRow icon={Calendar} label="Créé le" value={dateLong(data.createdAt)} />
                            <InfoRow icon={Calendar} label="Dernière MàJ" value={dateLong(data.updatedAt)} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog statut */}
            <Dialog open={dialog === "status"} onOpenChange={(o) => !o && setDialog(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Modifier le statut de {data.fullName}</DialogTitle></DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as AccountStatus)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {(Object.keys(STATUS_LABELS) as AccountStatus[]).map((s) => (
                                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialog(null)}>Annuler</Button>
                        <Button onClick={confirm} disabled={submitting}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog KYC */}
            <Dialog open={dialog === "kyc"} onOpenChange={(o) => !o && setDialog(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Modifier le KYC de {data.fullName}</DialogTitle></DialogHeader>
                    <div className="py-4">
                        <Select value={newKyc} onValueChange={(v) => setNewKyc(v as KycLevel)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {(Object.keys(KYC_LABELS) as KycLevel[]).map((k) => (
                                    <SelectItem key={k} value={k}>{KYC_LABELS[k]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialog(null)}>Annuler</Button>
                        <Button onClick={confirm} disabled={submitting}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
