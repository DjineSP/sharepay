import { useState, useEffect, useCallback } from "react";
import { transactionsService } from "@/features/merchant/transactions/services/transactions.service";
import {
    TransactionFilters,
    TransactionPage,
    TransactionOutFilters,
    TransactionOutPage,
    TransactionStatsData,
} from "@/features/merchant/transactions/types";

// ── Pay-in ────────────────────────────────────────────────────────────────────

interface UseTransactionsInResult {
    data: TransactionPage | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTransactionsIn(filters: TransactionFilters): UseTransactionsInResult {
    const [data,    setData]    = useState<TransactionPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        transactionsService
            .listIn(filters)
            .then(setData)
            .catch((err) => setError(err?.message ?? "Erreur de chargement"))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.size, filters.status, filters.type, filters.appId, filters.from, filters.to]);

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refetch: load };
}

// ── Pay-out ───────────────────────────────────────────────────────────────────

interface UseTransactionsOutResult {
    data: TransactionOutPage | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTransactionsOut(filters: TransactionOutFilters): UseTransactionsOutResult {
    const [data,    setData]    = useState<TransactionOutPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        transactionsService
            .listOut(filters)
            .then(setData)
            .catch((err) => setError(err?.message ?? "Erreur de chargement"))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.size, filters.status, filters.appId, filters.from, filters.to]);

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refetch: load };
}

// ── Stats ─────────────────────────────────────────────────────────────────────

interface UseTransactionStatsResult {
    data: TransactionStatsData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTransactionInStats(): UseTransactionStatsResult {
    const [data,    setData]    = useState<TransactionStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        transactionsService
            .getInStats()
            .then(setData)
            .catch((err) => setError(err?.message ?? "Erreur de chargement"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refetch: load };
}

export function useTransactionOutStats(): UseTransactionStatsResult {
    const [data,    setData]    = useState<TransactionStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        transactionsService
            .getOutStats()
            .then(setData)
            .catch((err) => setError(err?.message ?? "Erreur de chargement"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refetch: load };
}
