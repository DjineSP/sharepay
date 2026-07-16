import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import {
    MerchantSummaryResponse,
    Merchant360Response,
    PaginationResponse,
    UpdateStatusRequest,
    UpdateMerchantKycRequest,
    AccountStatus,
} from "@/features/admin/merchants/types";

export const adminMerchantsService = {
    async list(page = 0, size = 20, status?: AccountStatus): Promise<PaginationResponse<MerchantSummaryResponse>> {
        const params: Record<string, unknown> = { page, size };
        if (status) params.status = status;
        const res = await client.get<ApiResponse<PaginationResponse<MerchantSummaryResponse>>>(
            "/api/v1/admin/merchants",
            { params }
        );
        return parseApiResponse(res.data, res.status)!;
    },

    async get(id: string): Promise<MerchantSummaryResponse> {
        const res = await client.get<ApiResponse<MerchantSummaryResponse>>(`/api/v1/admin/merchants/${id}`);
        return parseApiResponse(res.data, res.status)!;
    },

    async getOverview(id: string): Promise<Merchant360Response> {
        const res = await client.get<ApiResponse<Merchant360Response>>(`/api/v1/admin/merchants/${id}/overview`);
        return parseApiResponse(res.data, res.status)!;
    },

    async updateStatus(id: string, request: UpdateStatusRequest): Promise<MerchantSummaryResponse> {
        const res = await client.patch<ApiResponse<MerchantSummaryResponse>>(
            `/api/v1/admin/merchants/${id}/status`,
            request
        );
        return parseApiResponse(res.data, res.status)!;
    },

    async updateKyc(id: string, request: UpdateMerchantKycRequest): Promise<MerchantSummaryResponse> {
        const res = await client.patch<ApiResponse<MerchantSummaryResponse>>(
            `/api/v1/admin/merchants/${id}/kyc`,
            request
        );
        return parseApiResponse(res.data, res.status)!;
    },
};
