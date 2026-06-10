"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { OverviewPageHeading } from "@/components/merchant/overview/overview-page-heading";
import { OverviewStatsGrid } from "@/components/merchant/overview/overview-stats-grid";
import { OverviewTransactionChartCard } from "@/components/merchant/overview/overview-transaction-chart-card";
import { OverviewRecentActivity } from "@/components/merchant/overview/overview-recent-activity";
import { type OverviewStat, type OverviewActivityItem } from "@/lib/data/dashboard";
import { useDashboard, TransactionStatus, type TransactionSummary } from "@/features/merchant/dashboard";
import { formatAmount } from "@/lib/utils";
import { Activity, Banknote, Bolt, ShoppingCart, TriangleAlert, RefreshCw, Hourglass, XCircle } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const PROVIDER_LOGOS: { match: string; src: string }[] = [
    { match: "MTN",    src: "/images/partners/logo_momo.png" },
    { match: "Orange", src: "/images/partners/logo_orange_money.png" },
];

function getProviderIcon(
    provider: string | null,
    fallbackIcon: React.ReactNode,
    fallbackWrap: string,
): { icon: React.ReactNode; iconWrapClassName: string } {
    if (!provider) {
        return {
            icon: (
                <Image
                    src="/icons/no-stopping.png"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 opacity-50"
                />
            ),
            iconWrapClassName: "bg-muted",
        };
    }
    const found = PROVIDER_LOGOS.find((p) => provider.includes(p.match));
    if (found) {
        return {
            icon: (
                <Image
                    src={found.src}
                    alt={provider}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                />
            ),
            iconWrapClassName: "overflow-hidden",
        };
    }
    return { icon: fallbackIcon, iconWrapClassName: fallbackWrap };
}

function formatRelativeDate(
    iso: string,
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    locale: string,
): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1)  return t("recentActivity.justNow");
    if (diffMin < 60) return t("recentActivity.minutesAgo", { count: diffMin });
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return t("recentActivity.hoursAgo", { count: diffH });
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

const STATUS_LABEL_KEYS: Record<TransactionStatus, string> = {
    SUCCESS:   "recentActivity.statuses.success",
    PENDING:   "recentActivity.statuses.pending",
    FAILED:    "recentActivity.statuses.failed",
    CANCELLED: "recentActivity.statuses.cancelled",
    REFUNDED:  "recentActivity.statuses.refunded",
};

const STATUS_CONFIG: Record<TransactionStatus, {
    amountClass: string;
    statusClass: string;
    iconWrap: string;
    icon: React.ReactNode;
    sign: "+" | "-" | "";
}> = {
    SUCCESS: {
        amountClass: "text-emerald-600",
        statusClass: "text-emerald-600/70",
        iconWrap: "bg-emerald-500/10 text-emerald-600",
        icon: <ShoppingCart className="h-5 w-5" />,
        sign: "+",
    },
    PENDING: {
        amountClass: "text-amber-600",
        statusClass: "text-amber-600/70",
        iconWrap: "bg-amber-500/10 text-amber-600",
        icon: <Hourglass className="h-5 w-5" />,
        sign: "",
    },
    FAILED: {
        amountClass: "text-red-600",
        statusClass: "text-red-600/70",
        iconWrap: "bg-red-500/10 text-red-600",
        icon: <TriangleAlert className="h-5 w-5" />,
        sign: "",
    },
    CANCELLED: {
        amountClass: "text-muted-foreground",
        statusClass: "text-muted-foreground",
        iconWrap: "bg-muted text-muted-foreground",
        icon: <XCircle className="h-5 w-5" />,
        sign: "",
    },
    REFUNDED: {
        amountClass: "text-foreground",
        statusClass: "text-muted-foreground",
        iconWrap: "bg-muted text-muted-foreground",
        icon: <RefreshCw className="h-5 w-5" />,
        sign: "-",
    },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const t = useTranslations("Dashboard.Overview");
    const locale = useLocale();

    const { data: dashboard, loading } = useDashboard();

    const currency = dashboard?.currency ?? "XAF";

    const stats: OverviewStat[] = [
        {
            label: t("stats.availableBalance"),
            value: loading ? "-" : formatAmount(dashboard?.availableBalance ?? 0, currency, locale),
            badge: { label: t("stats.availableBadge"), className: "text-emerald-600 bg-emerald-500/10" },
            icon: <Banknote className="h-5 w-5" />,
            iconWrapClassName: "bg-emerald-500/10 text-emerald-600",
        },
        {
            label: t("stats.pendingBalance"),
            value: loading ? "-" : formatAmount(dashboard?.pendingBalance ?? 0, currency, locale),
            badge: { label: t("stats.pendingBadge"), className: "text-amber-600 bg-amber-500/10" },
            icon: <Hourglass className="h-5 w-5" />,
            iconWrapClassName: "bg-amber-500/10 text-amber-600",
        },
        {
            label: t("stats.dailyVolume"),
            value: loading ? "-" : formatAmount(dashboard?.dailyVolume ?? 0, currency, locale),
            badge: {
                label: loading ? "-" : t("stats.txnCount", { count: dashboard?.todayTransactionCount ?? 0 }),
                className: "text-primary bg-primary/10",
            },
            icon: <Activity className="h-5 w-5" />,
            iconWrapClassName: "bg-primary/10 text-primary",
        },
    ];

    const activity: OverviewActivityItem[] = (dashboard?.lastFiveTransactions ?? []).map((tx: TransactionSummary) => {
        const cfg = STATUS_CONFIG[tx.status];
        const { icon, iconWrapClassName } = getProviderIcon(tx.provider, cfg.icon, cfg.iconWrap);
        const providerLabel = tx.provider ?? t("recentActivity.noProvider");
        return {
            id: tx.id,
            title: tx.description ?? tx.reference,
            meta: `${providerLabel} • ${formatRelativeDate(tx.updatedAt, t, locale)}`,
            payerAccount: tx.payerAccount,
            amount: `${cfg.sign}${formatAmount(tx.amount, tx.currency, locale)}`,
            status: t(STATUS_LABEL_KEYS[tx.status]),
            amountClassName: cfg.amountClass,
            statusClassName: cfg.statusClass,
            icon,
            iconWrapClassName,
        };
    });

    return (
        <div className="space-y-8">
            <OverviewPageHeading title={t("title")} subtitle={t("welcome")} />

            <OverviewStatsGrid stats={stats} isLoading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <OverviewTransactionChartCard />
                <OverviewRecentActivity
                    items={activity}
                    isLoading={loading}
                    onViewAll={() => router.push("/merchant/transactions")}
                    onLoadMore={() => router.push("/merchant/transactions")}
                />
            </div>
        </div>
    );
}
