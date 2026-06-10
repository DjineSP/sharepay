import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import { MerchantProfile, UpdateProfileRequest, ChangePasswordRequest } from "@/lib/types/account.types";

export const accountService = {

    /** GET /merchants/me - Profil complet du marchand connecté */
    async getProfile(): Promise<MerchantProfile> {
        const response = await client.get<ApiResponse<MerchantProfile>>("/api/v1/merchants/me");
        return parseApiResponse(response.data, response.status)!;
    },

    /** PATCH /merchants/me - Mise à jour partielle du profil */
    async updateProfile(data: UpdateProfileRequest): Promise<MerchantProfile> {
        const response = await client.patch<ApiResponse<MerchantProfile>>("/api/v1/merchants/me", data);
        return parseApiResponse(response.data, response.status)!;
    },

    /** PUT /merchants/me/password - Changement de mot de passe */
    async changePassword(data: ChangePasswordRequest): Promise<void> {
        await client.put("/api/v1/merchants/me/password", data);
    },

};
