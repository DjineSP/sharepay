"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactionsIn, useTransactionsOut, useTransactionInStats, useTransactionOutStats } from "@/features/merchant/transactions/hooks/use-transactions";
import { TransactionFilters, TransactionOutFilters } from "@/features/merchant/transactions/types";
import { TransactionsStatsCards } from "@/components/merchant/transactions/transactions-stats-cards";
import { TransactionsChart } from "@/components/merchant/transactions/transactions-chart";
import { TransactionsTable } from "@/components/merchant/transactions/transactions-table";
import { TransactionsOutTable } from "@/components/merchant/transactions/transactions-out-table";
import { TransactionDetailSheet } from "@/components/merchant/transactions/transaction-detail-sheet";

type SheetState = { id: string; mode: "in" | "out" } | null;

export default function TransactionsPage() {
    const t = useTranslations("Dashboard.Transactions");

    // ── Pay-in state ──────────────────────────────────────────────────────────
    const [filtersIn, setFiltersIn] = useState<TransactionFilters>({ page: 0, size: 20 });
    const { data: dataIn, loading: loadingIn, error: errorIn, refetch: refetchIn } = useTransactionsIn(filtersIn);
    const { data: statsIn, loading: loadingStatsIn } = useTransactionInStats();

    // ── Pay-out state ─────────────────────────────────────────────────────────
    const [filtersOut, setFiltersOut] = useState<TransactionOutFilters>({ page: 0, size: 20 });
    const { data: dataOut, loading: loadingOut, error: errorOut, refetch: refetchOut } = useTransactionsOut(filtersOut);
    const { data: statsOut, loading: loadingStatsOut } = useTransactionOutStats();

    // ── Detail sheet ──────────────────────────────────────────────────────────
    const [sheet, setSheet] = useState<SheetState>(null);

    return (
        <Tabs defaultValue="in" className="space-y-8">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-row items-center justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground truncate">
                        {t("title")}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1 truncate">
                        {t("subtitle")}
                    </p>
                </div>
                <TabsList className="shrink-0">
                    <TabsTrigger value="in" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">
                        <ArrowDownLeft className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{t("tabIn")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="out" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{t("tabOut")}</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* ── PAY-IN ──────────────────────────────────────────────────── */}
            <TabsContent value="in" className="space-y-8 mt-0">
                <TransactionsStatsCards data={statsIn} loading={loadingStatsIn} />

                <TransactionsChart mode="in" />

                <TransactionsTable
                    data={dataIn}
                    loading={loadingIn}
                    error={errorIn}
                    filters={filtersIn}
                    onFiltersChange={setFiltersIn}
                    onRowClick={(tx) => setSheet({ id: tx.id, mode: "in" })}
                    onRefresh={refetchIn}
                />
            </TabsContent>

            {/* ── PAY-OUT ─────────────────────────────────────────────────── */}
            <TabsContent value="out" className="space-y-8 mt-0">
                <TransactionsStatsCards data={statsOut} loading={loadingStatsOut} />

                <TransactionsChart mode="out" />

                <TransactionsOutTable
                    data={dataOut}
                    loading={loadingOut}
                    error={errorOut}
                    filters={filtersOut}
                    onFiltersChange={setFiltersOut}
                    onRowClick={(tx) => setSheet({ id: tx.id, mode: "out" })}
                    onRefresh={refetchOut}
                />
            </TabsContent>

            <TransactionDetailSheet
                id={sheet?.id ?? null}
                mode={sheet?.mode ?? "in"}
                open={sheet !== null}
                onClose={() => setSheet(null)}
            />
        </Tabs>
    );
}
