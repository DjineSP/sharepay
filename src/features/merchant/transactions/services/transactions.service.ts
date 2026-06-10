import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import { Transaction, TransactionFilters, TransactionPage } from "@/features/merchant/transactions/types";

export const transactionsService = {

    /** GET /merchants/transactions - Liste paginée des transactions du marchand */
    async list(filters?: TransactionFilters): Promise<TransactionPage> {
        const params = new URLSearchParams();
        if (filters?.page !== undefined) params.append("page", String(filters.page));
        if (filters?.size !== undefined) params.append("size", String(filters.size));
        if (filters?.status) params.append("status", filters.status);
        if (filters?.type) params.append("type", filters.type);
        const query = params.toString() ? `?${params}` : "";
        const response = await client.get<ApiResponse<TransactionPage>>(
            `/api/v1/merchants/transactions${query}`
        );
        return parseApiResponse(response.data, response.status)!;
    },

    /** GET /pay-in/check_status/:reference - Détail d'une transaction via son référence */
    async getByReference(reference: string): Promise<Transaction> {
        const response = await client.get<ApiResponse<Transaction>>(
            `/api/v1/pay-in/check_status/${reference}`
        );
        return parseApiResponse(response.data, response.status)!;
    },
};
