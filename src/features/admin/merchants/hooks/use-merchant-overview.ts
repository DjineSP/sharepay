import { useState, useEffect, useCallback } from "react";
import { adminMerchantsService } from "@/features/admin/merchants/services/merchants.service";
import { Merchant360Response } from "@/features/admin/merchants/types";

export function useMerchantOverview(merchantId: string) {
    const [data, setData] = useState<Merchant360Response | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await adminMerchantsService.getOverview(merchantId);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [merchantId]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
