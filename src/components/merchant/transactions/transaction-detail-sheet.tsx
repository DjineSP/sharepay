"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionStatus } from "@/features/merchant/transactions/types";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<TransactionStatus, { key: string; className: string }> = {
    SUCCESS:   { key: "statusSuccess",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0" },
    PENDING:   { key: "statusPending",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0" },
    FAILED:    { key: "statusFailed",    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0" },
    CANCELLED: { key: "statusCancelled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0" },
    REFUNDED:  { key: "statusRefunded",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0" },
};

// ── Hook: detect mobile breakpoint ───────────────────────────────────────────

function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [breakpoint]);
    return isMobile;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground shrink-0 mt-0.5 leading-5">
                {label}
            </span>
            <div className="text-right min-w-0 flex-1">{children}</div>
        </div>
    );
}

function CopyButton({ value, toastMsg }: { value: string; toastMsg: string }) {
    return (
        <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5"
            onClick={() => { navigator.clipboard.writeText(value); toast.success(toastMsg); }}
        >
            <Copy className="h-3.5 w-3.5" />
        </button>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface TransactionDetailSheetProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
}

export function TransactionDetailSheet({ transaction, open, onClose }: TransactionDetailSheetProps) {
    const t = useTranslations("Dashboard.Transactions.Detail");
    const isMobile = useIsMobile();

    const fmt = (amount: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(amount);

    const fmtDate = (iso: string) =>
        format(new Date(iso), "dd MMM yyyy, HH:mm", { locale: fr });

    const typeLabel = (type: string): string => {
        const map: Record<string, string> = {
            CHECKOUT:        t("typeCheckout"),
            CHARGE:          t("typeCharge"),
            FUND_COLLECTION: t("typeFundCollection"),
        };
        return map[type] ?? type;
    };

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={
                    isMobile
                        ? "rounded-t-2xl max-h-[88svh] flex flex-col p-0 w-full"
                        : "w-full sm:w-[480px] sm:max-w-[480px] flex flex-col p-0"
                }
            >
                {/* Drag handle - mobile only */}
                {isMobile && (
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1.5 rounded-full bg-muted-foreground/25" />
                    </div>
                )}

                {/* Sticky header */}
                <SheetHeader className="shrink-0 px-6 py-4 border-b">
                    <SheetTitle className="text-base sm:text-lg font-bold leading-tight">
                        {t("title")}
                    </SheetTitle>
                    {transaction && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {transaction.reference}
                        </p>
                    )}
                </SheetHeader>

                {/* Scrollable body */}
                {transaction && (
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        <div className="space-y-5 px-2 py-5">

                            {/* ── Section 1 : Général ─────────────────────── */}
                            <section className="px-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                                    {t("sectionGeneral")}
                                </p>
                                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                                    <InfoRow label={t("labelReference")}>
                                        <div className="flex items-center gap-1.5 justify-end min-w-0">
                                            <span className="font-mono text-xs font-semibold truncate">
                                                {transaction.reference}
                                            </span>
                                            <CopyButton value={transaction.reference} toastMsg={t("copiedId")} />
                                        </div>
                                    </InfoRow>
                                    {transaction.merchantReference && (
                                        <InfoRow label={t("labelMerchantRef")}>
                                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                                <span className="font-mono text-xs text-muted-foreground truncate">
                                                    {transaction.merchantReference}
                                                </span>
                                                <CopyButton value={transaction.merchantReference} toastMsg={t("copiedId")} />
                                            </div>
                                        </InfoRow>
                                    )}
                                    <InfoRow label={t("labelStatus")}>
                                        {(() => {
                                            const cfg = STATUS_CFG[transaction.status];
                                            return (
                                                <Badge className={`text-xs font-semibold ${cfg.className}`}>
                                                    {t(cfg.key as Parameters<typeof t>[0])}
                                                </Badge>
                                            );
                                        })()}
                                    </InfoRow>
                                    <InfoRow label={t("labelType")}>
                                        <Badge variant="outline" className="text-xs">
                                            {typeLabel(transaction.type)}
                                        </Badge>
                                    </InfoRow>
                                    <InfoRow label={t("labelDate")}>
                                        <span className="text-xs sm:text-sm whitespace-nowrap">
                                            {fmtDate(transaction.createdAt)}
                                        </span>
                                    </InfoRow>
                                    <InfoRow label={t("labelUpdated")}>
                                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                            {fmtDate(transaction.updatedAt)}
                                        </span>
                                    </InfoRow>
                                </div>
                            </section>

                            {/* ── Section 2 : Montants ─────────────────────── */}
                            <section className="px-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                                    {t("sectionAmounts")}
                                </p>
                                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                                    <InfoRow label={t("labelGrossAmount")}>
                                        <span className="font-semibold text-sm">{fmt(transaction.amount)}</span>
                                    </InfoRow>
                                    <InfoRow label={t("labelFees")}>
                                        <span className={`text-sm ${transaction.feeAmount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                            {transaction.feeAmount > 0 ? `− ${fmt(transaction.feeAmount)}` : "-"}
                                        </span>
                                    </InfoRow>
                                    <InfoRow label={t("labelNetAmount")}>
                                        <span className={`font-bold text-sm ${transaction.netAmount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                                            {transaction.netAmount > 0 ? fmt(transaction.netAmount) : "-"}
                                        </span>
                                    </InfoRow>
                                    <InfoRow label={t("labelCurrency")}>
                                        <span className="text-sm font-medium">{transaction.currency}</span>
                                    </InfoRow>
                                </div>
                            </section>

                            {/* ── Section 3 : Paiement ─────────────────────── */}
                            <section className="px-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                                    {t("sectionPayment")}
                                </p>
                                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                                    {transaction.payerName && (
                                        <InfoRow label={t("labelClient")}>
                                            <span className="font-medium text-sm truncate block">{transaction.payerName}</span>
                                        </InfoRow>
                                    )}
                                    {transaction.payerAccount && (
                                        <InfoRow label={t("labelPhone")}>
                                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                                <span className="font-mono text-sm truncate">{transaction.payerAccount}</span>
                                                <CopyButton value={transaction.payerAccount} toastMsg={t("copiedId")} />
                                            </div>
                                        </InfoRow>
                                    )}
                                    {transaction.payerEmail && (
                                        <InfoRow label={t("labelEmail")}>
                                            <span className="text-xs sm:text-sm truncate block max-w-[180px] sm:max-w-none ml-auto">
                                                {transaction.payerEmail}
                                            </span>
                                        </InfoRow>
                                    )}
                                    {transaction.provider && (
                                        <InfoRow label={t("labelProvider")}>
                                            <span className="text-sm font-medium">{transaction.provider}</span>
                                        </InfoRow>
                                    )}
                                    {transaction.description && (
                                        <InfoRow label={t("labelDescription")}>
                                            <span className="text-xs sm:text-sm text-muted-foreground">{transaction.description}</span>
                                        </InfoRow>
                                    )}
                                </div>
                            </section>

                            {/* ── Section 4 : Application ──────────────────── */}
                            {transaction.appName && (
                                <section className="px-2 pb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                                        {t("sectionApp")}
                                    </p>
                                    <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                                        <InfoRow label={t("labelApp")}>
                                            <span className="text-sm font-medium truncate block">{transaction.appName}</span>
                                        </InfoRow>
                                    </div>
                                </section>
                            )}

                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
