import type { ChartGroupBy } from "@/features/merchant/dashboard/types";

export type TransactionStatus  = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
export type TransactionType    = "CHECKOUT" | "CHARGE" | "FUND_COLLECTION";
export type TxChartInterval    = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM";
export type TxChartCustomType  = "YEAR" | "DAYS";

export type { ChartGroupBy };

// ── Pay-in summary (liste) ────────────────────────────────────────────────────

export interface Transaction {
    id: string;
    reference: string;
    merchantReference: string | null;
    type: TransactionType;
    amount: number;
    feeAmount: number;
    netAmount: number;
    currency: string;
    status: TransactionStatus;
    description: string | null;
    provider: string | null;
    payerAccount: string | null;
    payerName: string | null;
    payerEmail: string | null;
    appName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionPage {
    content: Transaction[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface TransactionFilters {
    status?: TransactionStatus | "";
    type?: TransactionType | "";
    appId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
}

// ── Pay-in detail ─────────────────────────────────────────────────────────────

export interface TransactionInDetail extends Transaction {
    providerTransactionId: string | null;
    appId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    successUrl: string | null;
    cancelUrl: string | null;
    failureReason: string | null;
    failureCode: string | null;
    expiresAt: string | null;
}

// ── Pay-out summary (liste) ───────────────────────────────────────────────────

export interface TransactionOut {
    id: string;
    reference: string;
    merchantReference: string | null;
    amount: number;
    feeAmount: number;
    netAmount: number;
    currency: string;
    status: TransactionStatus;
    description: string | null;
    provider: string | null;
    beneficiaryName: string;
    beneficiaryAccount: string | null;
    appName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionOutPage {
    content: TransactionOut[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface TransactionOutFilters {
    status?: TransactionStatus | "";
    appId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
}

// ── Pay-out detail ────────────────────────────────────────────────────────────

export interface TransactionOutDetail extends TransactionOut {
    providerTransactionId: string | null;
    appId: string | null;
    beneficiaryEmail: string | null;
    failureReason: string | null;
    failureCode: string | null;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface TransactionStatsData {
    total: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    cancelledCount: number;
}

// ── Chart ─────────────────────────────────────────────────────────────────────

export interface TxChartSeries {
    key: string;
    counts: number[];
    volumes: number[];
}

export interface TxChartData {
    interval: TxChartInterval;
    customType: TxChartCustomType | null;
    groupBy: ChartGroupBy;
    currency: string;
    labels: string[];
    series: TxChartSeries[];
}

export interface TxChartParams {
    interval: TxChartInterval;
    customType?: TxChartCustomType;
    year?: number;
    from?: string;
    to?: string;
    groupBy: ChartGroupBy;
}
