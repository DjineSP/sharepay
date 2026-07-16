import { AccountStatus, KycLevel, TransactionStatus, TransactionInType } from "@/features/admin/merchants/types";

export const STATUS_LABELS: Record<AccountStatus, string> = {
    ACTIVE: "Actif",
    PENDING_VERIFICATION: "En attente de vérification",
    SUSPENDED: "Suspendu",
    DELETED: "Supprimé",
};

export const KYC_LABELS: Record<KycLevel, string> = {
    NONE: "Aucun",
    BASIC: "Basique",
    VERIFIED: "Vérifié",
    ADVANCED: "Avancé",
};

export const TX_STATUS_LABELS: Record<TransactionStatus, string> = {
    PENDING: "En attente",
    SUCCESS: "Réussie",
    FAILED: "Échouée",
    CANCELLED: "Annulée",
    REFUNDED: "Remboursée",
};

export const TX_TYPE_LABELS: Record<TransactionInType, string> = {
    CHECKOUT: "Checkout",
    CHARGE: "Charge",
    FUND_COLLECTION: "Collecte",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const statusVariant = (s: AccountStatus): BadgeVariant =>
    s === "ACTIVE" ? "default" : s === "SUSPENDED" || s === "DELETED" ? "destructive" : "secondary";

export const kycVariant = (k: KycLevel): BadgeVariant =>
    k === "ADVANCED" ? "default" : k === "VERIFIED" ? "secondary" : "outline";

export const txStatusVariant = (s: TransactionStatus): BadgeVariant =>
    s === "SUCCESS" ? "default"
        : s === "FAILED" || s === "CANCELLED" ? "destructive"
        : s === "REFUNDED" ? "outline"
        : "secondary";
