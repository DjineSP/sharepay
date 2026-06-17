"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { TransactionStatsData } from "@/features/merchant/transactions/types";

interface TransactionsStatsCardsProps {
    data: TransactionStatsData | null;
    loading?: boolean;
}

export function TransactionsStatsCards({ data, loading }: TransactionsStatsCardsProps) {
    const t = useTranslations("Dashboard.Transactions.Stats");

    const total        = data?.total ?? 0;
    const successCount = data?.successCount ?? 0;
    const pendingCount = data?.pendingCount ?? 0;
    const failedCount  = data?.failedCount  ?? 0;

    const successRate  = total > 0 ? Math.round((successCount / total) * 100) : 0;
    const failedRate   = total > 0 ? Math.round((failedCount  / total) * 100) : 0;

    const skeleton = loading && !data;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {/* Réussies */}
            <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-xl border shadow-sm min-w-0">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded shrink-0 ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {successRate}% {t("successRate")}
                    </span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate">{t("success")}</p>
                <span className={`block text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground truncate mt-1 ${skeleton ? "animate-pulse bg-muted rounded w-16 h-8" : ""}`}>
                    {!skeleton && successCount.toLocaleString("fr-FR")}
                </span>
                <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${successRate}%` }} />
                </div>
            </div>

            {/* En attente */}
            <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-xl border shadow-sm min-w-0">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg shrink-0 bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate">{t("pending")}</p>
                <span className={`block text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground truncate mt-1 ${skeleton ? "animate-pulse bg-muted rounded w-16 h-8" : ""}`}>
                    {!skeleton && pendingCount.toLocaleString("fr-FR")}
                </span>
            </div>

            {/* Échouées */}
            <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-xl border shadow-sm min-w-0">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg shrink-0 bg-red-100 dark:bg-red-900/30">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded shrink-0 ml-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {failedRate}% {t("failedRate")}
                    </span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate">{t("failed")}</p>
                <span className={`block text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground truncate mt-1 ${skeleton ? "animate-pulse bg-muted rounded w-16 h-8" : ""}`}>
                    {!skeleton && failedCount.toLocaleString("fr-FR")}
                </span>
                <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${failedRate}%` }} />
                </div>
            </div>
        </div>
    );
}
