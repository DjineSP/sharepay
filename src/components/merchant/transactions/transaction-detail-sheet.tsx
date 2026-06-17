"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { transactionsService } from "@/features/merchant/transactions/services/transactions.service";
import {
    TransactionInDetail,
    TransactionOutDetail,
    TransactionStatus,
} from "@/features/merchant/transactions/types";

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<TransactionStatus, { key: string; className: string }> = {
    SUCCESS:   { key: "statusSuccess",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0" },
    PENDING:   { key: "statusPending",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0" },
    FAILED:    { key: "statusFailed",    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0" },
    CANCELLED: { key: "statusCancelled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0" },
    REFUNDED:  { key: "statusRefunded",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0" },
};

function useIsMobile(bp = 640) {
    const [m, setM] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
        const h = (e: MediaQueryListEvent) => setM(e.matches);
        setM(mq.matches);
        mq.addEventListener("change", h);
        return () => mq.removeEventListener("change", h);
    }, [bp]);
    return m;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground shrink-0 mt-0.5 leading-5">{label}</span>
            <div className="text-right min-w-0 flex-1">{children}</div>
        </div>
    );
}

function CopyBtn({ value, msg }: { value: string; msg: string }) {
    return (
        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5"
            onClick={() => { navigator.clipboard.writeText(value); toast.success(msg); }}>
            <Copy className="h-3.5 w-3.5" />
        </button>
    );
}

function SkeletonRows({ n }: { n: number }) {
    return (
        <>{Array.from({ length: n }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        ))}</>
    );
}

// ── Pay-in Detail ─────────────────────────────────────────────────────────────

function InDetailBody({ t, detail }: { t: ReturnType<typeof useTranslations<"Dashboard.Transactions.Detail">>; detail: TransactionInDetail }) {
    const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);
    const fmtDate = (iso: string) => format(new Date(iso), "dd MMM yyyy, HH:mm", { locale: fr });
    const typeMap: Record<string, string> = { CHECKOUT: t("typeCheckout"), CHARGE: t("typeCharge"), FUND_COLLECTION: t("typeFundCollection") };
    const cfg = STATUS_CFG[detail.status];

    return (
        <div className="space-y-5 px-2 py-5">
            {/* Général */}
            <section className="px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionGeneral")}</p>
                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                    <InfoRow label={t("labelReference")}>
                        <div className="flex items-center gap-1.5 justify-end min-w-0">
                            <span className="font-mono text-xs font-semibold truncate">{detail.reference}</span>
                            <CopyBtn value={detail.reference} msg={t("copiedId")} />
                        </div>
                    </InfoRow>
                    {detail.merchantReference && (
                        <InfoRow label={t("labelMerchantRef")}>
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                <span className="font-mono text-xs text-muted-foreground truncate">{detail.merchantReference}</span>
                                <CopyBtn value={detail.merchantReference} msg={t("copiedId")} />
                            </div>
                        </InfoRow>
                    )}
                    <InfoRow label={t("labelStatus")}>
                        <Badge className={`text-xs font-semibold ${cfg.className}`}>{t(cfg.key as Parameters<typeof t>[0])}</Badge>
                    </InfoRow>
                    <InfoRow label={t("labelType")}>
                        <Badge variant="outline" className="text-xs">{typeMap[detail.type] ?? detail.type}</Badge>
                    </InfoRow>
                    <InfoRow label={t("labelDate")}><span className="text-xs whitespace-nowrap">{fmtDate(detail.createdAt)}</span></InfoRow>
                    <InfoRow label={t("labelUpdated")}><span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(detail.updatedAt)}</span></InfoRow>
                    {detail.expiresAt && (
                        <InfoRow label={t("labelExpiry")}><span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(detail.expiresAt)}</span></InfoRow>
                    )}
                </div>
            </section>

            {/* Montants */}
            <section className="px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionAmounts")}</p>
                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                    <InfoRow label={t("labelGrossAmount")}><span className="font-semibold text-sm">{fmt(detail.amount)}</span></InfoRow>
                    <InfoRow label={t("labelFees")}>
                        <span className={`text-sm ${detail.feeAmount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {detail.feeAmount > 0 ? `− ${fmt(detail.feeAmount)}` : "-"}
                        </span>
                    </InfoRow>
                    <InfoRow label={t("labelNetAmount")}>
                        <span className={`font-bold text-sm ${detail.netAmount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                            {detail.netAmount > 0 ? fmt(detail.netAmount) : "-"}
                        </span>
                    </InfoRow>
                    <InfoRow label={t("labelCurrency")}><span className="text-sm font-medium">{detail.currency}</span></InfoRow>
                </div>
            </section>

            {/* Paiement / Payeur */}
            <section className="px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionPayment")}</p>
                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                    {detail.customerName && <InfoRow label={t("labelCustomerName")}><span className="font-medium text-sm truncate block">{detail.customerName}</span></InfoRow>}
                    {detail.customerEmail && <InfoRow label={t("labelCustomerEmail")}><span className="text-xs truncate block">{detail.customerEmail}</span></InfoRow>}
                    {detail.customerPhone && <InfoRow label={t("labelCustomerPhone")}><span className="font-mono text-sm">{detail.customerPhone}</span></InfoRow>}
                    {detail.payerName && <InfoRow label={t("labelClient")}><span className="font-medium text-sm truncate block">{detail.payerName}</span></InfoRow>}
                    {detail.payerAccount && (
                        <InfoRow label={t("labelPhone")}>
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                <span className="font-mono text-sm truncate">{detail.payerAccount}</span>
                                <CopyBtn value={detail.payerAccount} msg={t("copiedId")} />
                            </div>
                        </InfoRow>
                    )}
                    {detail.payerEmail && <InfoRow label={t("labelEmail")}><span className="text-xs truncate block ml-auto max-w-[180px]">{detail.payerEmail}</span></InfoRow>}
                    {detail.provider && <InfoRow label={t("labelProvider")}><span className="text-sm font-medium">{detail.provider}</span></InfoRow>}
                    {detail.providerTransactionId && (
                        <InfoRow label={t("labelProviderRef")}>
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                <span className="font-mono text-xs truncate">{detail.providerTransactionId}</span>
                                <CopyBtn value={detail.providerTransactionId} msg={t("copiedId")} />
                            </div>
                        </InfoRow>
                    )}
                    {detail.description && <InfoRow label={t("labelDescription")}><span className="text-xs text-muted-foreground">{detail.description}</span></InfoRow>}
                </div>
            </section>

            {/* Échec */}
            {(detail.failureReason || detail.failureCode) && (
                <section className="px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionFailure")}</p>
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl divide-y divide-border/40">
                        {detail.failureCode && <InfoRow label={t("labelFailureCode")}><span className="font-mono text-xs text-destructive">{detail.failureCode}</span></InfoRow>}
                        {detail.failureReason && <InfoRow label={t("labelFailureReason")}><span className="text-xs text-destructive">{detail.failureReason}</span></InfoRow>}
                    </div>
                </section>
            )}

            {/* Application */}
            {detail.appName && (
                <section className="px-2 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionApp")}</p>
                    <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                        <InfoRow label={t("labelApp")}><span className="text-sm font-medium truncate block">{detail.appName}</span></InfoRow>
                    </div>
                </section>
            )}
        </div>
    );
}

// ── Pay-out Detail ────────────────────────────────────────────────────────────

function OutDetailBody({ t, detail }: { t: ReturnType<typeof useTranslations<"Dashboard.Transactions.Detail">>; detail: TransactionOutDetail }) {
    const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);
    const fmtDate = (iso: string) => format(new Date(iso), "dd MMM yyyy, HH:mm", { locale: fr });
    const cfg = STATUS_CFG[detail.status];

    return (
        <div className="space-y-5 px-2 py-5">
            {/* Général */}
            <section className="px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionGeneral")}</p>
                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                    <InfoRow label={t("labelReference")}>
                        <div className="flex items-center gap-1.5 justify-end min-w-0">
                            <span className="font-mono text-xs font-semibold truncate">{detail.reference}</span>
                            <CopyBtn value={detail.reference} msg={t("copiedId")} />
                        </div>
                    </InfoRow>
                    {detail.merchantReference && (
                        <InfoRow label={t("labelMerchantRef")}>
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                <span className="font-mono text-xs text-muted-foreground truncate">{detail.merchantReference}</span>
                                <CopyBtn value={detail.merchantReference} msg={t("copiedId")} />
                            </div>
                        </InfoRow>
                    )}
                    <InfoRow label={t("labelStatus")}>
                        <Badge className={`text-xs font-semibold ${cfg.className}`}>{t(cfg.key as Parameters<typeof t>[0])}</Badge>
                    </InfoRow>
                    <InfoRow label={t("labelDate")}><span className="text-xs whitespace-nowrap">{fmtDate(detail.createdAt)}</span></InfoRow>
                    <InfoRow label={t("labelUpdated")}><span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(detail.updatedAt)}</span></InfoRow>
                </div>
            </section>

            {/* Montants */}
            <section className="px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionAmounts")}</p>
                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                    <InfoRow label={t("labelGrossAmount")}><span className="font-semibold text-sm">{fmt(detail.amount)}</span></InfoRow>
                    <InfoRow label={t("labelFees")}>
                        <span className={`text-sm ${detail.feeAmount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {detail.feeAmount > 0 ? `− ${fmt(detail.feeAmount)}` : "-"}
                        </span>
                    </InfoRow>
                    <InfoRow label={t("labelNetAmount")}>
                        <span className={`font-bold text-sm ${detail.netAmount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                            {detail.netAmount > 0 ? fmt(detail.netAmount) : "-"}
                        </span>
                    </InfoRow>
                    <InfoRow label={t("labelCurrency")}><span className="text-sm font-medium">{detail.currency}</span></InfoRow>
                </div>
            </section>

            {/* Bénéficiaire */}
            <section className="px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionBeneficiary")}</p>
                <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                    <InfoRow label={t("labelBeneficiary")}><span className="font-medium text-sm">{detail.beneficiaryName}</span></InfoRow>
                    {detail.beneficiaryAccount && (
                        <InfoRow label={t("labelBeneficiaryAccount")}>
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                <span className="font-mono text-sm truncate">{detail.beneficiaryAccount}</span>
                                <CopyBtn value={detail.beneficiaryAccount} msg={t("copiedId")} />
                            </div>
                        </InfoRow>
                    )}
                    {detail.beneficiaryEmail && <InfoRow label={t("labelEmail")}><span className="text-xs truncate block">{detail.beneficiaryEmail}</span></InfoRow>}
                    {detail.provider && <InfoRow label={t("labelProvider")}><span className="text-sm font-medium">{detail.provider}</span></InfoRow>}
                    {detail.providerTransactionId && (
                        <InfoRow label={t("labelProviderRef")}>
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                                <span className="font-mono text-xs truncate">{detail.providerTransactionId}</span>
                                <CopyBtn value={detail.providerTransactionId} msg={t("copiedId")} />
                            </div>
                        </InfoRow>
                    )}
                    {detail.description && <InfoRow label={t("labelDescription")}><span className="text-xs text-muted-foreground">{detail.description}</span></InfoRow>}
                </div>
            </section>

            {/* Échec */}
            {(detail.failureReason || detail.failureCode) && (
                <section className="px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionFailure")}</p>
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl divide-y divide-border/40">
                        {detail.failureCode && <InfoRow label={t("labelFailureCode")}><span className="font-mono text-xs text-destructive">{detail.failureCode}</span></InfoRow>}
                        {detail.failureReason && <InfoRow label={t("labelFailureReason")}><span className="text-xs text-destructive">{detail.failureReason}</span></InfoRow>}
                    </div>
                </section>
            )}

            {/* Application */}
            {detail.appName && (
                <section className="px-2 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">{t("sectionApp")}</p>
                    <div className="bg-muted/40 rounded-xl divide-y divide-border/40">
                        <InfoRow label={t("labelApp")}><span className="text-sm font-medium truncate block">{detail.appName}</span></InfoRow>
                    </div>
                </section>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface TransactionDetailSheetProps {
    id: string | null;
    mode: "in" | "out";
    open: boolean;
    onClose: () => void;
}

export function TransactionDetailSheet({ id, mode, open, onClose }: TransactionDetailSheetProps) {
    const t = useTranslations("Dashboard.Transactions.Detail");
    const isMobile = useIsMobile();

    const [inDetail,  setInDetail]  = React.useState<TransactionInDetail | null>(null);
    const [outDetail, setOutDetail] = React.useState<TransactionOutDetail | null>(null);
    const [loading,   setLoading]   = React.useState(false);
    const [error,     setError]     = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!open || !id) { setInDetail(null); setOutDetail(null); return; }
        setLoading(true);
        setError(null);
        const call = mode === "in"
            ? transactionsService.getInDetail(id).then((d) => setInDetail(d))
            : transactionsService.getOutDetail(id).then((d) => setOutDetail(d));
        call
            .catch(() => setError("Impossible de charger les détails"))
            .finally(() => setLoading(false));
    }, [open, id, mode]);

    const reference = mode === "in" ? inDetail?.reference : outDetail?.reference;

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={isMobile
                    ? "rounded-t-2xl max-h-[88svh] flex flex-col p-0 w-full"
                    : "w-full sm:w-[480px] sm:max-w-[480px] flex flex-col p-0"}
            >
                {isMobile && (
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1.5 rounded-full bg-muted-foreground/25" />
                    </div>
                )}

                <SheetHeader className="shrink-0 px-6 py-4 border-b">
                    <SheetTitle className="text-base sm:text-lg font-bold leading-tight">
                        {mode === "in" ? t("titleIn") : t("titleOut")}
                    </SheetTitle>
                    {reference && <p className="text-xs text-muted-foreground font-mono mt-0.5">{reference}</p>}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {loading && (
                        <div className="space-y-5 px-4 py-5">
                            {[6, 4, 5].map((n, i) => (
                                <div key={i} className="bg-muted/40 rounded-xl divide-y divide-border/40">
                                    <SkeletonRows n={n} />
                                </div>
                            ))}
                        </div>
                    )}
                    {error && (
                        <div className="m-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                            {error}
                        </div>
                    )}
                    {!loading && !error && mode === "in"  && inDetail  && <InDetailBody  t={t} detail={inDetail} />}
                    {!loading && !error && mode === "out" && outDetail && <OutDetailBody t={t} detail={outDetail} />}
                    {!loading && !error && !inDetail && !outDetail && (
                        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement…
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
