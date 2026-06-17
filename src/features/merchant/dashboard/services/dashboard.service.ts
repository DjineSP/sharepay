import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import { ChartGroupBy, ChartInterval, MerchantDashboardData, TransactionChartData } from "@/features/merchant/dashboard/types";

export const dashboardService = {

    /** GET /merchants/dashboard - Tableau de bord du marchand connecté */
    async getMerchantDashboard(): Promise<MerchantDashboardData> {
        const response = await client.get<ApiResponse<MerchantDashboardData>>("/api/v1/merchants/dashboard");
        return parseApiResponse(response.data, response.status)!;
    },

    async getTransactionChart(interval: ChartInterval, groupBy: ChartGroupBy): Promise<TransactionChartData> {
        const intervalMap: Record<ChartInterval, string> = {
            TODAY:        "TODAY",
            LAST_7_DAYS:  "THIS_WEEK",
            LAST_30_DAYS: "THIS_MONTH",
        };
        const response = await client.get<ApiResponse<TransactionChartData>>(
            "/api/v1/merchants/transactions-in/chart",
            { params: { interval: intervalMap[interval], groupBy } }
        );
        return parseApiResponse(response.data, response.status)!;
    },
};
