import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import {
    AppResponse,
    CreateAppRequest,
    UpdateAppRequest,
} from "@/features/merchant/apps/types";

export const appsService = {

    async list(): Promise<AppResponse[]> {
        const response = await client.get<ApiResponse<AppResponse[]>>("/api/v1/merchants/apps");
        return parseApiResponse(response.data, response.status) ?? [];
    },

    async getById(id: string): Promise<AppResponse> {
        const response = await client.get<ApiResponse<AppResponse>>(`/api/v1/merchants/apps/${id}`);
        return parseApiResponse(response.data, response.status)!;
    },

    async create(data: CreateAppRequest): Promise<AppResponse> {
        const response = await client.post<ApiResponse<AppResponse>>("/api/v1/merchants/apps", data);
        return parseApiResponse(response.data, response.status)!;
    },

    async update(id: string, data: UpdateAppRequest): Promise<AppResponse> {
        const response = await client.patch<ApiResponse<AppResponse>>(`/api/v1/merchants/apps/${id}`, data);
        return parseApiResponse(response.data, response.status)!;
    },

    async remove(id: string): Promise<void> {
        await client.delete(`/api/v1/merchants/apps/${id}`);
        // 204 No Content - no body to parse
    },
};
