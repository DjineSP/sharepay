import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import { AdminOverviewResponse } from "@/features/admin/stats/types";

export const adminStatsService = {
    async getOverview(): Promise<AdminOverviewResponse> {
        const res = await client.get<ApiResponse<AdminOverviewResponse>>("/api/v1/admin/stats/overview");
        return parseApiResponse(res.data, res.status)!;
    },
};
