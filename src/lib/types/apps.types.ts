import { ApiResponse } from "@/lib/api/types";

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ─── Enums ────────────────────────────────────────────────────────────────────
export type AppEnvironment = "PRODUCTION" | "SANDBOX";
export type AppStatus = "ACTIVE" | "INACTIVE";
export type ApiKeyType = "PUBLIC" | "SECRET";
export type ApiKeyStatus = "ACTIVE" | "REVOKED";

// ─── ApiKeyResponse - returned by the API ────────────────────────────────────
// secretKey is only visible at creation or key rotation.
export interface ApiKeyResponse {
    id: string;
    appId: string;
    keyType: ApiKeyType;
    keyPrefix: string;   // e.g. "pk_live_" - always visible
    secretKey?: string;  // full key - ONLY at creation or rotation, then gone
    status: ApiKeyStatus;
    lastUsedAt: string | null;
    createdAt: string;
}

// ─── AppResponse - main app entity returned by the API ───────────────────────
export interface AppResponse {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    siteUrl: string | null;
    logoUrl: string | null;
    themeColor: string | null;
    environment: AppEnvironment;
    status: AppStatus;
    webhookUrl: string | null;
    fallbackUrl: string | null;
    createdAt: string;
    apiKeys?: ApiKeyResponse[]; // only populated at creation or key rotation
}

// ─── Create app - POST /api/v1/apps ──────────────────────────────────────────
export interface CreateAppRequest {
    name: string;                    // required
    environment: AppEnvironment;     // required
    description?: string;
    siteUrl?: string;
    logoUrl?: string | null;
    themeColor?: string;
    webhookUrl?: string;
    fallbackUrl?: string;
}

// ─── Update app - PUT /api/v1/apps/{id} ──────────────────────────────────────
export interface UpdateAppRequest {
    name?: string;
    description?: string;
    siteUrl?: string;
    logoUrl?: string | null;
    themeColor?: string;
    webhookUrl?: string;
    fallbackUrl?: string;
    status?: AppStatus;
}
