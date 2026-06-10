import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import {
    AppResponse,
    ApiKeyResponse,
    CreateAppRequest,
    UpdateAppRequest,
} from "@/lib/types/apps.types";

/**
 * Service de gestion des applications marchandes.
 * Toutes les erreurs sont des `ApiError` - utiliser `isApiError(e)` pour les gérer.
 */
export const appsService = {

    // ── Applications ──────────────────────────────────────────────────────────

    /** GET /apps - Toutes les apps du marchand connecté */
    async list(): Promise<AppResponse[]> {
        const response = await client.get<ApiResponse<AppResponse[]>>("/api/v1/merchants/apps");
        return parseApiResponse(response.data, response.status) ?? [];
    },

    /** GET /apps/production - Apps en environnement PRODUCTION uniquement */
    async listProduction(): Promise<AppResponse[]> {
        const response = await client.get<ApiResponse<AppResponse[]>>("/api/v1/merchants/apps/production");
        return parseApiResponse(response.data, response.status) ?? [];
    },

    /** GET /apps/sandbox - Apps en environnement SANDBOX uniquement */
    async listSandbox(): Promise<AppResponse[]> {
        const response = await client.get<ApiResponse<AppResponse[]>>("/api/v1/merchants/apps/sandbox");
        return parseApiResponse(response.data, response.status) ?? [];
    },

    /** GET /apps/{id} - Détail d'une application par son ID */
    async getById(id: string): Promise<AppResponse> {
        const response = await client.get<ApiResponse<AppResponse>>(`/api/v1/merchants/apps/${id}`);
        return parseApiResponse(response.data, response.status)!;
    },

    /**
     * POST /apps - Crée une nouvelle application.
     * La réponse inclut les `apiKeys` (PUBLIC + SECRET) - visibles UNE SEULE FOIS.
     */
    async create(data: CreateAppRequest): Promise<AppResponse> {
        const response = await client.post<ApiResponse<AppResponse>>("/api/v1/merchants/apps", data);
        return parseApiResponse(response.data, response.status)!;
    },

    /**
     * PUT /apps/{id} - Met à jour les champs modifiables de l'app.
     * L'environnement (PRODUCTION/SANDBOX) n'est pas modifiable après création.
     */
    async update(id: string, data: UpdateAppRequest): Promise<AppResponse> {
        const response = await client.put<ApiResponse<AppResponse>>(`/api/v1/merchants/apps/${id}`, data);
        return parseApiResponse(response.data, response.status)!;
    },

    /** DELETE /apps/{id} - Supprime une application */
    async remove(id: string): Promise<void> {
        const response = await client.delete<ApiResponse<null>>(`/api/v1/merchants/apps/${id}`);
        parseApiResponse(response.data, response.status);
    },

    // ── Clés API ──────────────────────────────────────────────────────────────

    /**
     * GET /apps/{appId}/keys - Liste les clés API actives.
     * Note : `secretKey` n'est jamais retourné ici (uniquement à la création/rotation).
     */
    async getKeys(appId: string): Promise<ApiKeyResponse[]> {
        const response = await client.get<ApiResponse<ApiKeyResponse[]>>(`/api/v1/merchants/apps/${appId}/keys`);
        return parseApiResponse(response.data, response.status) ?? [];
    },

    /**
     * POST /apps/{appId}/keys - Régénère toutes les clés (rotation).
     * Révoque toutes les clés actives et en génère de nouvelles.
     * Les `secretKey` sont visibles UNE SEULE FOIS dans la réponse.
     */
    async rotateKeys(appId: string): Promise<ApiKeyResponse[]> {
        const response = await client.post<ApiResponse<ApiKeyResponse[]>>(`/api/v1/merchants/apps/${appId}/keys`);
        return parseApiResponse(response.data, response.status) ?? [];
    },

    /** DELETE /apps/{appId}/keys/{keyId} - Révoque une clé API spécifique */
    async revokeKey(appId: string, keyId: string): Promise<void> {
        const response = await client.delete<ApiResponse<null>>(`/api/v1/merchants/apps/${appId}/keys/${keyId}`);
        parseApiResponse(response.data, response.status);
    },
};
