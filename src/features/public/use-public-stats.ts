import { useState, useEffect } from "react";
import { publicStatsService, PublicStats } from "./public-stats.service";

export function usePublicStats() {
    const [data, setData]       = useState<PublicStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        publicStatsService.get()
            .then(setData)
            .catch(() => { /* silently keep null - fallback values shown */ })
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
