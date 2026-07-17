import { AccountStatus, KycLevel, TransactionStatus } from "@/features/admin/merchants/types";

export interface AdminMerchantMini {
    id: string;
    fullName: string;
    email: string;
    status: AccountStatus;
    kycLevel: KycLevel;
    createdAt: string;
}

export interface AdminTxMini {
    id: string;
    reference: string;
    merchantName: string;
    status: TransactionStatus;
    amount: number;
    currency: string;
    createdAt: string;
}

export interface AdminOverviewResponse {
    payInVolume: number;
    payOutVolume: number;
    floatAvailable: number;
    floatPending: number;
    merchantsTotal: number;
    merchantsActive: number;
    merchantsPending: number;
    txTotal: number;
    txSuccess: number;
    pendingVerification: AdminMerchantMini[];
    recentMerchants: AdminMerchantMini[];
    recentTransactions: AdminTxMini[];
}
