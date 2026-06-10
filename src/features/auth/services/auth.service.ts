import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import { tokenStorage } from "@/lib/token-storage";
import {
    LoginRequest,
    RegisterRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    VerifyResetCodeRequest,
    ResetPasswordRequest,
    AuthTokenData,
    VerifyResetCodeResponse,
} from "@/features/auth/types";

/*
    Service d'authentification - toutes les erreurs sont des `ApiError`.
    Consommer avec `isApiError(e)` de `@/lib/api/error-codes` pour gérer les cas.
*/
export const authService = {
    /*
        POST /auth/login
        @param rememberMe  true → localStorage (30 jours), false → sessionStorage
    */
    async login(data: LoginRequest, rememberMe: boolean = false): Promise<AuthTokenData> {
        const response = await client.post<ApiResponse<AuthTokenData>>("/api/v1/auth/login", data);
        const authData = parseApiResponse(response.data, response.status);

        tokenStorage.set(
            {
                accessToken: authData!.accessToken,
                refreshToken: authData!.refreshToken,
                tokenType: "Bearer",
            },
            { persist: rememberMe }
        );
        tokenStorage.setUser(authData!.user);

        return authData!;
    },

    async register(data: RegisterRequest): Promise<void> {
        const response = await client.post<ApiResponse<null>>("/api/v1/auth/register", data);
        parseApiResponse(response.data, response.status);
    },

    /*  POST /auth/verify-email-otp */
    async verifyEmail(data: VerifyEmailRequest): Promise<void> {
        const response = await client.post<ApiResponse<null>>("/api/v1/auth/verify-email-otp", data);
        parseApiResponse(response.data, response.status);
    },

    /*  POST /auth/resend-verify-email-code */
    async resendOtp(email: string): Promise<void> {
        const response = await client.post<ApiResponse<null>>("/api/v1/auth/resend-verify-email-code", { email });
        parseApiResponse(response.data, response.status);
    },

    async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
        const response = await client.post<ApiResponse<null>>("/api/v1/auth/forgot-password", data);
        parseApiResponse(response.data, response.status);
    },

    /*  POST /auth/verify-reset-password-otp */
    async verifyResetCode(data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> {
        const response = await client.post<ApiResponse<VerifyResetCodeResponse>>(
            "/api/v1/auth/verify-reset-password-otp",
            data
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        const response = await client.post<ApiResponse<null>>("/api/v1/auth/reset-password", data);
        parseApiResponse(response.data, response.status);
    },

    /*
        POST /auth/refresh-token - Le refresh automatique est géré par l'intercepteur dans client.ts.
        Cette méthode est utile uniquement pour forcer un refresh explicitement.
    */
    async refreshToken(refreshToken: string): Promise<AuthTokenData> {
        const response = await client.post<ApiResponse<AuthTokenData>>("/api/v1/auth/refresh-token", {
            refreshToken,
        });
        const authData = parseApiResponse(response.data, response.status)!;

        tokenStorage.set({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            tokenType: "Bearer",
        });

        return authData;
    },

    /*
        POST /auth/logout - Révoque le refresh token côté backend.
        L'access token reste valide jusqu'à son expiration (15 min max).
        Le stockage local est nettoyé dans tous les cas.
    */
    async logout(): Promise<void> {
        try {
            const tokens = tokenStorage.get();
            if (tokens?.refreshToken) {
                await client.post<ApiResponse<null>>("/api/v1/auth/logout", {
                    refreshToken: tokens.refreshToken,
                });
            }
        } finally {
            tokenStorage.clear();
        }
    },

    // Non implémenté - intégration OAuth Google à venir
    async loginWithGoogle(): Promise<void> {
        throw new Error("Google login not yet implemented with backend");
    },
};
