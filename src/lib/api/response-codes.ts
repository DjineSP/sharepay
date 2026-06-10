import { ApiError } from "./error";

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

// ---------------------------------------------------------------------------
// Codes d'ERREUR - codes exacts retournés par le backend
// ---------------------------------------------------------------------------
const ERROR_CODE_MAP: Record<string, string> = {
    // ── Auth - AuthServiceImpl ───────────────────────────────────────────────
    INVALID_CREDENTIALS:        "invalid_credentials",
    USER_NOT_FOUND:             "user_not_found",
    EMAIL_ALREADY_EXISTS:       "email_exists",
    EMAIL_NOT_VERIFIED:         "not_verified",
    OTP_INVALID:                "invalid_otp",
    OTP_EXPIRED:                "otp_expired",
    OTP_NOT_FOUND:              "otp_not_found",
    ACCOUNT_NOT_ACTIVE:         "account_disabled",
    ACCOUNT_ALREADY_VERIFIED:   "already_verified",
    INVALID_REFRESH_TOKEN:      "invalid_token",
    COMPROMISED_SESSION:        "compromised_session",
    EXPIRED_SESSION:            "session_expired",
    INVALID_TOKEN_TYPE:         "invalid_token",
    INVALID_RESET_TOKEN:        "invalid_reset_token",

    // ── JWT filter - JwtAuthenticationFilter ─────────────────────────────────
    INVALID_TOKEN:              "invalid_token",
    TOKEN_EXPIRED:              "session_expired",
    UNEXPECTED_ERROR_OCCURRED:  "internal_server_error",

    // ── API Key filter - ApiKeyAuthenticationFilter ───────────────────────────
    API_KEY_MISSING:            "api_key_missing",
    API_KEY_INVALID:            "api_key_invalid",
    API_KEY_REVOKED:            "api_key_revoked",

    // ── Rate limiting ─────────────────────────────────────────────────────────
    TOO_MANY_REQUESTS:          "too_many_requests",

    // ── Applications - ApplicationServiceImpl ────────────────────────────────
    APP_NOT_FOUND:              "app_not_found",
    APP_NAME_ALREADY_EXISTS:    "app_name_duplicate",  // code réel du backend
    APP_ACCESS_DENIED:          "access_denied",

    // ── Clés API - ApiKeyServiceImpl ─────────────────────────────────────────
    API_KEY_NOT_FOUND:          "api_key_not_found",
    API_KEY_ALREADY_ACTIVE:     "api_key_already_active",

    // ── Paiements entrants / sortants ─────────────────────────────────────────
    TRANSACTION_NOT_FOUND:      "transaction_not_found",
    PROVIDER_NOT_FOUND:         "provider_not_found",
    CURRENCY_MISMATCH:          "currency_mismatch",
    AMOUNT_BELOW_MINIMUM:       "amount_below_minimum",
    AMOUNT_ABOVE_MAXIMUM:       "amount_above_maximum",
    INSUFFICIENT_BALANCE:       "insufficient_balance",

    // ── Collectes de fonds - FundCollectionServiceImpl ───────────────────────
    COLLECTION_NOT_FOUND:       "collection_not_found",
    COLLECTION_NOT_EDITABLE:    "collection_not_editable",
    COLLECTION_ALREADY_CLOSED:  "collection_already_closed",
    COLLECTION_NOT_CLOSED:      "collection_not_closed",
    COLLECTION_NOT_AVAILABLE:   "collection_not_available",
    AMOUNT_REQUIRED_FOR_FIXED:  "amount_required",

    // ── Checkout public - PaymentPublicController ────────────────────────────
    SESSION_NOT_FOUND:          "session_not_found",
    INVALID_SESSION:            "invalid_session",
    SESSION_ALREADY_PROCESSED:  "session_already_processed",
    SESSION_EXPIRED:            "session_expired",
    COLLECT_NOT_FOUND:          "collection_not_found",
    COLLECT_NOT_ACTIVE:         "collection_not_active",
    COLLECT_EXPIRED:            "collection_expired",
    AMOUNT_REQUIRED:            "amount_required",
    PROVIDER_INACTIVE:          "provider_not_found",

    // ── Webhooks ──────────────────────────────────────────────────────────────
    WEBHOOK_URL_NOT_CONFIGURED: "webhook_not_configured",
    WEBHOOK_TEST_FAILED:        "webhook_test_failed",

    // ── Passerelles de paiement (MTN MoMo / Orange Money) ────────────────────
    MTN_GATEWAY_ERROR:          "gateway_error",
    MTN_INTERNAL_ERROR:         "gateway_error",
    MTN_AUTH_ERROR:             "gateway_error",
    ORANGE_GATEWAY_ERROR:       "gateway_error",
    ORANGE_INTERNAL_ERROR:      "gateway_error",
    ORANGE_AUTH_ERROR:          "gateway_error",

    // ── Liens de paiement (héritage) ─────────────────────────────────────────
    PAYMENT_LINK_NOT_FOUND:     "payment_link_not_found",
    PAYMENT_LINK_EXPIRED:       "payment_link_expired",
    PAYMENT_LINK_INACTIVE:      "payment_link_inactive",

    // ── GlobalExceptionHandler ────────────────────────────────────────────────
    UNAUTHORIZED:               "unauthorized",
    ACCESS_DENIED:              "access_denied",
    RESOURCE_NOT_FOUND:         "route_not_found",
    ENTITY_NOT_FOUND:           "route_not_found",
    VALIDATION_ERROR:           "validation_error",
    MALFORMED_JSON:             "malformed_json",
    INVALID_PARAMETER:          "validation_error",
    INTERNAL_SERVER_ERROR:      "internal_server_error",

    // ── BusinessException sans code spécifique ────────────────────────────────
    BUSINESS_ERROR:             "business_error",

    // ── Réseau / système ──────────────────────────────────────────────────────
    NETWORK_ERROR:              "network_error",
    UNKNOWN_ERROR:              "unknown_error",
};

/** Retourne la clé i18n `Auth.Errors.*` correspondant au code backend. */
export function getErrorMessageKey(code: string): string {
    return ERROR_CODE_MAP[code] ?? "unknown_error";
}

// ---------------------------------------------------------------------------
// Helper - résout l'erreur en clé i18n + valeurs d'interpolation
// À utiliser dans les catch de toutes les pages.
//
//   const { messageKey, values } = resolveError(error);
//   toast.error(tGlobal(messageKey, values));
// ---------------------------------------------------------------------------
export function resolveError(error: unknown): {
    messageKey: string;
    values?: Record<string, string | number | Date>;
} {
    if (!isApiError(error)) {
        return { messageKey: "Auth.Errors.unknown_error" };
    }

    if (error.code === "TOO_MANY_REQUESTS") {
        if (error.retryAfter && error.retryAfter > 0) {
            const minutes = Math.max(1, Math.ceil(error.retryAfter / 60));
            return { messageKey: "Auth.Errors.too_many_requests_timed", values: { minutes } };
        }
        return { messageKey: "Auth.Errors.too_many_requests" };
    }

    return { messageKey: `Auth.Errors.${getErrorMessageKey(error.code)}` };
}

// ---------------------------------------------------------------------------
// Codes de SUCCÈS - clés → section `Auth.Success.*` de l'i18n
// ---------------------------------------------------------------------------

/** Clés de succès pour chaque opération d'authentification. */
export const SUCCESS_KEYS = {
    AUTH_LOGIN: "login",
    AUTH_REGISTER: "register",
    AUTH_VERIFY_EMAIL: "verify_email",
    AUTH_RESEND_OTP: "resend_otp",
    AUTH_FORGOT_PASSWORD: "forgot_password",
    AUTH_VERIFY_RESET_CODE: "verify_reset_code",
    AUTH_RESET_PASSWORD: "reset_password",
} as const;

export type SuccessKey = (typeof SUCCESS_KEYS)[keyof typeof SUCCESS_KEYS];
