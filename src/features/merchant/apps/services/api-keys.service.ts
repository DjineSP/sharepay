import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import {
    ApiKeyResponse,
    CreateApiKeyRequest,
    RotateApiKeyRequest,
} from "@/features/merchant/apps/types";

export const apiKeysService = {

    async create(appId: string, data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
        const response = await client.post<ApiResponse<ApiKeyResponse>>(`/api/v1/merchants/apps/${appId}/api-keys`, data);
        return parseApiResponse(response.data, response.status)!;
    },

    async list(appId: string): Promise<ApiKeyResponse[]> {
        const response = await client.get<ApiResponse<ApiKeyResponse[]>>(`/api/v1/merchants/apps/${appId}/api-keys`);
        return parseApiResponse(response.data, response.status) ?? [];
    },

    async getActive(appId: string): Promise<ApiKeyResponse> {
        const response = await client.get<ApiResponse<ApiKeyResponse>>(`/api/v1/merchants/apps/${appId}/api-keys/active`);
        return parseApiResponse(response.data, response.status)!;
    },

    async rotate(appId: string, data: RotateApiKeyRequest): Promise<ApiKeyResponse> {
        const response = await client.post<ApiResponse<ApiKeyResponse>>(`/api/v1/merchants/apps/${appId}/api-keys/rotate`, data);
        return parseApiResponse(response.data, response.status)!;
    },

    async revoke(appId: string): Promise<void> {
        await client.delete(`/api/v1/merchants/apps/${appId}/api-keys`);
        // 204 No Content - no body to parse
    },
};
