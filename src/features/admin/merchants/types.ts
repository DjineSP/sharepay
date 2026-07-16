// Aligné sur les enums backend (shared/constant) :
//   AccountStatus : ACTIVE, PENDING_VERIFICATION, SUSPENDED, DELETED
//   KycLevel      : NONE, BASIC, VERIFIED, ADVANCED
export type AccountStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "DELETED";
export type KycLevel = "NONE" | "BASIC" | "VERIFIED" | "ADVANCED";

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
export type TransactionInType = "CHECKOUT" | "CHARGE" | "FUND_COLLECTION";

export interface MerchantSummaryResponse {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    country: string;
    status: AccountStatus;
    kycLevel: KycLevel;
    emailVerified: boolean;
    createdAt: string;
}

export interface PaginationResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface UpdateStatusRequest {
    status: AccountStatus;
}

export interface UpdateMerchantKycRequest {
    kycLevel: KycLevel;
}

// --- Vue 360 ---

export interface BalanceInfo {
    currency: string;
    availableAmount: number;
    pendingAmount: number;
    updatedAt: string;
}

export interface StatusBucket {
    count: number;
    sumAmount: number;
}

export interface TransactionStats {
    totalCount: number;
    totalVolume: number;
    byStatus: Record<TransactionStatus, StatusBucket>;
}

export interface Merchant360TransactionIn {
    id: string;
    reference: string;
    type: TransactionInType;
    status: TransactionStatus;
    amount: number;
    feeAmount: number;
    netAmount: number;
    currency: string;
    providerName: string | null;
    payerAccount: string | null;
    customerName: string | null;
    failureCode: string | null;
    createdAt: string;
}

export interface Merchant360Payout {
    id: string;
    reference: string;
    status: TransactionStatus;
    amount: number;
    feeAmount: number;
    netAmount: number;
    currency: string;
    providerName: string | null;
    beneficiaryName: string | null;
    beneficiaryAccount: string | null;
    failureCode: string | null;
    createdAt: string;
}

export interface Merchant360Response {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    country: string | null;
    avatarUrl: string | null;
    status: AccountStatus;
    kycLevel: KycLevel;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
    balances: BalanceInfo[];
    payInStats: TransactionStats;
    payOutStats: TransactionStats;
    transactionsIn: Merchant360TransactionIn[];
    payouts: Merchant360Payout[];
}
