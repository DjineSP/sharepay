"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { CopyPlus, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ApplicationData, AppCard } from "./app-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AppsGridProps {
    applications: ApplicationData[];
    onSettingsClick: (id: string) => void;
    onRefresh?: () => void;
    isLoading?: boolean;
}

export function AppsGrid({ applications, onSettingsClick, onRefresh, isLoading = false }: AppsGridProps) {
    const t = useTranslations("Dashboard.Apps");
    const [searchQuery, setSearchQuery] = useState("");
    const [envFilter, setEnvFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    const filteredAndSortedApps = useMemo(() => {
        let result = [...applications];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (app) => app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
            );
        }
        if (envFilter !== "all") {
            result = result.filter((app) => app.activeKeyEnvironment === envFilter);
        }
        result.sort((a, b) => {
            const dA = new Date(a.createdAt).getTime();
            const dB = new Date(b.createdAt).getTime();
            return sortOrder === "newest" ? dB - dA : dA - dB;
        });
        return result;
    }, [applications, searchQuery, envFilter, sortOrder]);

    const hasApps = applications.length > 0;
    const hasActiveFilters = searchQuery.trim() !== "" || envFilter !== "all";

    return (
        <div className="space-y-6">
            {/* ── Filters Bar - always visible ──────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Left block: Search + Refresh */}
                <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder={t("Filters.searchPlaceholder")}
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {onRefresh && (
                        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading} className="shrink-0">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    )}
                </div>

                {/* Right block: Env filter + Sort order */}
                <div className="flex items-center gap-2 shrink-0">
                    <Select value={envFilter} onValueChange={setEnvFilter} disabled={isLoading}>
                        <SelectTrigger className="flex-1 sm:flex-none sm:w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("Filters.envAll")}</SelectItem>
                            <SelectItem value="LIVE">{t("Filters.envLive")}</SelectItem>
                            <SelectItem value="TEST">{t("Filters.envTest")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortOrder} onValueChange={setSortOrder} disabled={isLoading}>
                        <SelectTrigger className="flex-1 sm:flex-none sm:w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("Filters.sortNewest")}</SelectItem>
                            <SelectItem value="oldest">{t("Filters.sortOldest")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Grid area ─────────────────────────────────────────────────── */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-card rounded-xl border p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                                <div className="space-y-2 flex-1 min-w-0">
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-1/3 rounded" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-full rounded" />
                            <Skeleton className="h-3 w-2/3 rounded" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : !hasApps ? (
                /* Empty - no apps at all */
                <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed rounded-2xl border-border bg-muted/5 text-center">
                    <div className="relative mb-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <CopyPlus className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary/20 border-2 border-background" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{t("EmptyState.title")}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{t("EmptyState.description")}</p>
                    <Button asChild className="gap-2 font-bold shadow-lg shadow-primary/20">
                        <Link href="/merchant/apps/new">
                            <CopyPlus className="h-4 w-4" />
                            {t("EmptyState.cta")}
                        </Link>
                    </Button>
                </div>
            ) : filteredAndSortedApps.length === 0 ? (
                /* Empty - filters returned nothing */
                <div className="flex flex-col items-center justify-center py-16 px-6 border rounded-2xl border-border bg-muted/5 text-center">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                        <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">{t("EmptyState.noResults")}</p>
                    <p className="text-sm text-muted-foreground mb-4">{t("EmptyState.noResultsHint")}</p>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => { setSearchQuery(""); setEnvFilter("all"); }}
                        >
                            <X className="h-3.5 w-3.5" />
                            {t("EmptyState.clearFilters")}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredAndSortedApps.map((app) => (
                        <AppCard
                            key={app.id}
                            app={app}
                            onSettingsClick={onSettingsClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
