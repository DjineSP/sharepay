import { useState, useEffect, useCallback } from "react";
import { adminStatsService } from "@/features/admin/stats/services/stats.service";
import { AdminOverviewResponse } from "@/features/admin/stats/types";

export function useAdminOverview() {
    const [data, setData] = useState<AdminOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await adminStatsService.getOverview());
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
