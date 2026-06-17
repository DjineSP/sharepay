import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import {
    TransactionFilters,
    TransactionInDetail,
    TransactionOutDetail,
    TransactionOutFilters,
    TransactionOutPage,
    TransactionPage,
    TransactionStatsData,
    TxChartData,
    TxChartParams,
} from "@/features/merchant/transactions/types";

function buildParams(obj: Record<string, string | number | boolean | undefined | null>): URLSearchParams {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null && v !== "") p.append(k, String(v));
    }
    return p;
}

export const transactionsService = {

    // ── Pay-in ────────────────────────────────────────────────────────────────

    async getInStats(): Promise<TransactionStatsData> {
        const response = await client.get<ApiResponse<TransactionStatsData>>(
            "/api/v1/merchants/transactions-in/stats"
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async listIn(filters?: TransactionFilters): Promise<TransactionPage> {
        const q = buildParams({
            page:   filters?.page,
            size:   filters?.size,
            status: filters?.status,
            type:   filters?.type,
            appId:  filters?.appId,
            from:   filters?.from,
            to:     filters?.to,
        });
        const response = await client.get<ApiResponse<TransactionPage>>(
            `/api/v1/merchants/transactions-in${q.size ? `?${q}` : ""}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async getInDetail(id: string): Promise<TransactionInDetail> {
        const response = await client.get<ApiResponse<TransactionInDetail>>(
            `/api/v1/merchants/transactions-in/${id}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async getInChart(params: TxChartParams): Promise<TxChartData> {
        const q = buildParams({
            interval:   params.interval,
            customType: params.customType,
            year:       params.year,
            from:       params.from,
            to:         params.to,
            groupBy:    params.groupBy,
        });
        const response = await client.get<ApiResponse<TxChartData>>(
            `/api/v1/merchants/transactions-in/chart${q.size ? `?${q}` : ""}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

    // ── Pay-out ───────────────────────────────────────────────────────────────

    async getOutStats(): Promise<TransactionStatsData> {
        const response = await client.get<ApiResponse<TransactionStatsData>>(
            "/api/v1/merchants/transactions-out/stats"
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async listOut(filters?: TransactionOutFilters): Promise<TransactionOutPage> {
        const q = buildParams({
            page:   filters?.page,
            size:   filters?.size,
            status: filters?.status,
            appId:  filters?.appId,
            from:   filters?.from,
            to:     filters?.to,
        });
        const response = await client.get<ApiResponse<TransactionOutPage>>(
            `/api/v1/merchants/transactions-out${q.size ? `?${q}` : ""}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async getOutDetail(id: string): Promise<TransactionOutDetail> {
        const response = await client.get<ApiResponse<TransactionOutDetail>>(
            `/api/v1/merchants/transactions-out/${id}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

    async getOutChart(params: TxChartParams): Promise<TxChartData> {
        const q = buildParams({
            interval:   params.interval,
            customType: params.customType,
            year:       params.year,
            from:       params.from,
            to:         params.to,
            groupBy:    params.groupBy,
        });
        const response = await client.get<ApiResponse<TxChartData>>(
            `/api/v1/merchants/transactions-out/chart${q.size ? `?${q}` : ""}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

};
