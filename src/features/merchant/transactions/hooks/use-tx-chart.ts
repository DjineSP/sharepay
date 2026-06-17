import { useState, useEffect, useCallback } from "react";
import { transactionsService } from "@/features/merchant/transactions/services/transactions.service";
import { TxChartData, TxChartParams } from "@/features/merchant/transactions/types";

interface UseTxChartResult {
    data: TxChartData | null;
    loading: boolean;
    error: string | null;
}

export function useTxChart(mode: "in" | "out", params: TxChartParams): UseTxChartResult {
    const [data,    setData]    = useState<TxChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const fetch = useCallback(() => {
        setLoading(true);
        setError(null);
        const call = mode === "in"
            ? transactionsService.getInChart(params)
            : transactionsService.getOutChart(params);
        call
            .then(setData)
            .catch((err) => setError(err?.message ?? "Erreur de chargement"))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, params.interval, params.customType, params.year, params.from, params.to, params.groupBy]);

    useEffect(() => { fetch(); }, [fetch]);
    return { data, loading, error };
}
