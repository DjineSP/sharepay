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

    /** GET /merchants/transactions/chart - Données du graphique de transactions */
    async getTransactionChart(interval: ChartInterval, groupBy: ChartGroupBy): Promise<TransactionChartData> {
        const response = await client.get<ApiResponse<TransactionChartData>>(
            "/api/v1/merchants/transactions/chart",
            { params: { interval, groupBy } }
        );
        return parseApiResponse(response.data, response.status)!;
    },
};
