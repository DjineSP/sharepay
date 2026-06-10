import { ApiResponse } from "@/lib/api/types";

export type { ApiResponse };

export type AppStatus         = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type AppKeyEnvironment = "LIVE" | "TEST";

export interface ApiKeyResponse {
    id: string;
    name: string;
    keyPrefix: string;
    environment: AppKeyEnvironment;
    active: boolean;
    plainTextKey?: string;        // full key - returned only once at creation/rotation
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApiKeyRequest {
    name: string;
    environment: AppKeyEnvironment;
}

export interface RotateApiKeyRequest {
    name: string;
    environment: AppKeyEnvironment;
}

export interface AppResponse {
    id: string;
    name: string;
    description: string;
    status: AppStatus;
    currency: string;
    themeColor: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    webhookUrl: string | null;
    plainTextWebhookSecret?: string; // visible once at creation
    successUrl: string | null;
    cancelUrl: string | null;
    activeKeyPrefix: string | null;
    activeKeyEnvironment: AppKeyEnvironment | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAppRequest {
    name: string;
    description?: string;
    logoUrl?: string | null;
    websiteUrl?: string;
    themeColor?: string;
    currency: string;
    webhookUrl?: string;
    successUrl?: string;
    cancelUrl?: string;
}

export interface UpdateAppRequest {
    name?: string;
    description?: string;
    logoUrl?: string | null;
    websiteUrl?: string;
    themeColor?: string;
    webhookUrl?: string;
    successUrl?: string;
    cancelUrl?: string;
}

// ── Webhook ────────────────────────────────────────────────────────────────────

export type WebhookDeliveryStatus = "PENDING" | "DELIVERED" | "FAILED";

export interface AppWebhookResponse {
    applicationId: string;
    applicationName: string;
    webhookUrl: string | null;
    webhookSecretPrefix: string | null;
    plainTextWebhookSecret?: string;
    updatedAt: string;
}

export interface UpdateAppWebhookRequest {
    webhookUrl?: string | null;
}

export interface TestWebhookResponse {
    delivered: boolean;
    webhookUrl: string;
    httpStatus: number | null;
    sentAt: string;
}

export interface WebhookDeliveryResponse {
    id: string;
    eventName: string;
    status: WebhookDeliveryStatus;
    httpStatus: number | null;
    attemptCount: number;
    nextRetryAt: string | null;
    lastError: string | null;
    createdAt: string;
}

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
}
