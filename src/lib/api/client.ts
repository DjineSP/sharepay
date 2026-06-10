import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/lib/token-storage";
import { ApiError } from "@/lib/api/error";
import { ApiResponse } from "@/lib/api/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

/*
    Refresh Token Queue - anti-race condition.
    Si 3 requêtes reçoivent un 401 simultanément, seul le 1er lance le refresh.
    Les autres attendent dans la file et reprennent avec le nouveau token.
*/
type QueueCallback = (error: ApiError | null, accessToken: string | null) => void;

let isRefreshing = false;
let refreshQueue: QueueCallback[] = [];

function drainQueue(error: ApiError | null, accessToken: string | null): void {
    refreshQueue.forEach((cb) => cb(error, accessToken));
    refreshQueue = [];
}

// Injection du token Bearer
client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const tokens = tokenStorage.get();
        if (tokens?.accessToken) {
            config.headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Refresh token safe + ApiError unifié
client.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!error.response) {
            return Promise.reject(new ApiError("NETWORK_ERROR", "network_error"));
        }

        const status = error.response.status;
        const responseData = error.response.data as ApiResponse | undefined;

        if (status === 429) {
            const retryAfter = parseInt(error.response.headers["retry-after"] ?? "0") || undefined;
            return Promise.reject(new ApiError("TOO_MANY_REQUESTS", "TOO_MANY_REQUESTS", 429, retryAfter));
        }

        if (status !== 401) {
            const code = responseData?.code ?? "UNKNOWN_ERROR";
            const message = responseData?.message ?? code;
            return Promise.reject(new ApiError(code, message, status));
        }

        const url = originalRequest.url ?? "";
        const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/refresh-token");

        if (isAuthRoute || originalRequest._retry) {
            const code = responseData?.code ?? "UNAUTHORIZED";
            const message = responseData?.message ?? code;
            return Promise.reject(new ApiError(code, message, 401));
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise<AxiosResponse>((resolve, reject) => {
                refreshQueue.push((queueError, newAccessToken) => {
                    if (queueError || !newAccessToken) {
                        reject(queueError ?? new ApiError("UNAUTHORIZED", "Session expirée."));
                        return;
                    }
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    resolve(client(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            const tokens = tokenStorage.get();

            if (!tokens?.refreshToken) {
                throw new ApiError("UNAUTHORIZED", "Aucun refresh token disponible.");
            }

            const refreshResponse = await axios.post<ApiResponse<{
                accessToken: string;
                refreshToken: string;
            }>>(
                `${baseURL}/api/v1/auth/refresh-token`,
                { refreshToken: tokens.refreshToken },
                { headers: { "Content-Type": "application/json" } }
            );

            const body = refreshResponse.data;

            if (!body.success || !body.data) {
                throw new ApiError(
                    body.code ?? "EXPIRED_SESSION",
                    body.message ?? "EXPIRED_SESSION"
                );
            }

            const newTokens = body.data;

            tokenStorage.set({
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
                tokenType: "Bearer",
            });

            drainQueue(null, newTokens.accessToken);

            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return client(originalRequest);
        } catch (refreshError) {
            const apiError =
                refreshError instanceof ApiError
                    ? refreshError
                    : new ApiError("EXPIRED_SESSION", "EXPIRED_SESSION");

            drainQueue(apiError, null);

            if (typeof window !== "undefined") {
                const user = tokenStorage.getUser();
                tokenStorage.clear();

                const role = user?.role;
                const loginPath =
                    role === "ADMIN" ? "/admin/login" :
                    role === "SUPPORT" ? "/support/login" :
                    "/merchant/login";

                if (!window.location.pathname.includes(loginPath)) {
                    const segments = window.location.pathname.split("/");
                    const locale = ["en", "fr"].includes(segments[1]) ? `/${segments[1]}` : "";
                    window.location.href = `${locale}${loginPath}`;
                }
            } else {
                tokenStorage.clear();
            }

            return Promise.reject(apiError);
        } finally {
            isRefreshing = false;
        }
    }
);
