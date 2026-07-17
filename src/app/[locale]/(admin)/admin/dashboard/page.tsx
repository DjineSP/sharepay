"use client";

import { useRouter } from "@/i18n/routing";
import { AdminPageHeading } from "@/components/admin/overview/admin-page-heading";
import { AdminStatsGrid, AdminStat } from "@/components/admin/overview/admin-stats-grid";
import { AdminActivityFeed, AdminActivityItem } from "@/components/admin/overview/admin-activity-feed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users, Wallet, TrendingUp, TrendingDown, Percent, ShieldCheck,
    ArrowUpRight, UserPlus, CheckCircle2,
} from "lucide-react";

import { useAdminOverview } from "@/features/admin/stats";
import { AdminMerchantMini } from "@/features/admin/stats/types";
import { STATUS_LABELS, KYC_LABELS, TX_STATUS_LABELS, statusVariant } from "@/features/admin/merchants/labels";
import { formatAmount } from "@/lib/utils";

const money = (n: number) => formatAmount(n, "XAF");
const dateShort = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

function MerchantRow({ m, onClick }: { m: AdminMerchantMini; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-muted/40 transition-colors text-left"
        >
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                {(m.fullName || "M").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{m.fullName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Badge variant={statusVariant(m.status)} className="hidden sm:inline-flex">{STATUS_LABELS[m.status]}</Badge>
                <span className="text-[11px] text-muted-foreground hidden md:inline">{KYC_LABELS[m.kycLevel]}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
        </button>
    );
}

function ListCard({
    title, icon: Icon, count, children,
}: { title: string; icon: React.ElementType; count?: number; children: React.ReactNode }) {
    return (
        <div className="bg-card text-card-foreground rounded-xl border flex flex-col overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold">{title}</h3>
                </div>
                {count !== undefined && count > 0 && (
                    <Badge variant="secondary">{count}</Badge>
                )}
            </div>
            <div className="flex-1 max-h-[420px] overflow-y-auto">{children}</div>
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/60" />
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { data, loading, error, refetch } = useAdminOverview();

    const successRate = data && data.txTotal > 0
        ? Math.round((data.txSuccess / data.txTotal) * 1000) / 10
        : 0;

    const stats: AdminStat[] = [
        {
            label: "Volume encaissé",
            value: money(data?.payInVolume ?? 0),
            icon: <TrendingUp className="h-5 w-5" />,
            iconWrapClassName: "bg-emerald-500/10 text-emerald-600",
            badge: { label: `${data?.txSuccess ?? 0} réussies`, className: "text-emerald-600 bg-emerald-500/10" },
        },
        {
            label: "Volume payouts",
            value: money(data?.payOutVolume ?? 0),
            icon: <TrendingDown className="h-5 w-5" />,
            iconWrapClassName: "bg-amber-500/10 text-amber-600",
        },
        {
            label: "Float détenu",
            value: money(data?.floatAvailable ?? 0),
            icon: <Wallet className="h-5 w-5" />,
            iconWrapClassName: "bg-primary/10 text-primary",
            badge: { label: `${money(data?.floatPending ?? 0)} en attente`, className: "text-muted-foreground bg-muted" },
        },
        {
            label: "Marchands",
            value: `${data?.merchantsTotal ?? 0}`,
            icon: <Users className="h-5 w-5" />,
            iconWrapClassName: "bg-blue-500/10 text-blue-600",
            badge: { label: `${data?.merchantsActive ?? 0} actifs`, className: "text-blue-600 bg-blue-500/10" },
        },
        {
            label: "Taux de réussite",
            value: `${successRate}%`,
            icon: <Percent className="h-5 w-5" />,
            iconWrapClassName: "bg-violet-500/10 text-violet-600",
            progress: { value: successRate, className: "bg-violet-500" },
        },
        {
            label: "À vérifier (KYB)",
            value: `${data?.merchantsPending ?? 0}`,
            icon: <ShieldCheck className="h-5 w-5" />,
            iconWrapClassName: "bg-red-500/10 text-red-600",
            badge: (data?.merchantsPending ?? 0) > 0
                ? { label: "À traiter", className: "text-red-600 bg-red-500/10" }
                : { label: "À jour", className: "text-emerald-600 bg-emerald-500/10" },
        },
    ];

    const txItems: AdminActivityItem[] = (data?.recentTransactions ?? []).map((t) => ({
        id: t.id,
        title: t.merchantName,
        meta: `${t.reference} • ${dateShort(t.createdAt)}`,
        badge: money(t.amount),
        status: TX_STATUS_LABELS[t.status],
        badgeClassName: "text-foreground",
        statusClassName: t.status === "SUCCESS" ? "text-emerald-600/80"
            : t.status === "FAILED" || t.status === "CANCELLED" ? "text-red-600/80"
            : "text-muted-foreground",
        icon: <span className="text-xs font-bold">{t.currency}</span>,
        iconWrapClassName: "bg-muted text-muted-foreground",
    }));

    return (
        <div className="space-y-8">
            <AdminPageHeading
                title="Tableau de Bord Administrateur"
                subtitle="Vue d'ensemble de l'écosystème SharePay"
                action={
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Actualiser
                    </Button>
                }
            />

            {error ? (
                <div className="rounded-xl border bg-card p-10 text-center text-destructive">
                    Impossible de charger les statistiques de la plateforme.
                </div>
            ) : (
                <>
                    <AdminStatsGrid stats={stats} isLoading={loading} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* File de vérification KYB (actionnable) */}
                        <div className="xl:col-span-2">
                            <ListCard
                                title="File de vérification (KYB)"
                                icon={ShieldCheck}
                                count={data?.pendingVerification.length}
                            >
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                                    </div>
                                ) : !data?.pendingVerification.length ? (
                                    <EmptyState label="Aucun marchand en attente de vérification" />
                                ) : (
                                    data.pendingVerification.map((m) => (
                                        <MerchantRow key={m.id} m={m} onClick={() => router.push(`/admin/merchants/${m.id}`)} />
                                    ))
                                )}
                            </ListCard>
                        </div>

                        {/* Dernières transactions */}
                        <AdminActivityFeed
                            title="Dernières transactions"
                            viewAllLabel="Voir tout"
                            items={txItems}
                            onViewAll={() => router.push("/admin/merchants")}
                        />
                    </div>

                    {/* Derniers marchands inscrits */}
                    <ListCard title="Derniers marchands inscrits" icon={UserPlus}>
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                            </div>
                        ) : !data?.recentMerchants.length ? (
                            <EmptyState label="Aucun marchand" />
                        ) : (
                            data.recentMerchants.map((m) => (
                                <MerchantRow key={m.id} m={m} onClick={() => router.push(`/admin/merchants/${m.id}`)} />
                            ))
                        )}
                    </ListCard>
                </>
            )}
        </div>
    );
}
