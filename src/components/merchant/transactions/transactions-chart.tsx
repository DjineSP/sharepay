"use client";

import { useRef, useState, useMemo, useId, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useTxChart } from "@/features/merchant/transactions/hooks/use-tx-chart";
import {
    ChartGroupBy,
    TxChartData,
    TxChartInterval,
    TxChartCustomType,
    TxChartParams,
} from "@/features/merchant/transactions/types";

type ChartMetric = "COUNT" | "VOLUME";

// ── Palettes ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    SUCCESS:   "#10b981",
    PENDING:   "#f59e0b",
    FAILED:    "#ef4444",
    CANCELLED: "#94a3b8",
    REFUNDED:  "#3b82f6",
};
const PROVIDER_COLORS: Record<string, string> = {
    "MTN Mobile Money Cameroun": "#fbbf24",
    "Orange Money Cameroun":     "#f97316",
};
const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#14b8a6"];

function hashColor(key: string) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
    return PALETTE[Math.abs(h) % PALETTE.length];
}
function seriesColor(key: string, groupBy: ChartGroupBy) {
    if (groupBy === "STATUS")   return STATUS_COLORS[key]   ?? hashColor(key);
    if (groupBy === "PROVIDER") return PROVIDER_COLORS[key] ?? hashColor(key);
    return hashColor(key);
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtVol(v: number) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${Math.round(v / 1_000)}k`;
    return String(v);
}

// ── SVG constants ─────────────────────────────────────────────────────────────

const VB_W = 1060, VB_H = 310, ML = 52, MR = 16, MT = 14, MB = 38;
const IW = VB_W - ML - MR, IH = VB_H - MT - MB;

function niceTicks(rawMax: number, n = 5) {
    if (rawMax === 0) return { niceMax: 10, ticks: [0, 2, 4, 6, 8, 10] };
    const step   = rawMax / (n - 1);
    const mag    = Math.pow(10, Math.floor(Math.log10(step)));
    const nice   = Math.max(1, Math.round(Math.ceil(step / mag) * mag));
    return { niceMax: nice * (n - 1), ticks: Array.from({ length: n }, (_, i) => i * nice) };
}

function smoothPath(pts: { x: number; y: number }[], tension = 0.1, yMin = -Infinity, yMax = Infinity) {
    if (!pts.length) return "";
    if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
    const cy = (y: number) => Math.max(yMin, Math.min(yMax, y));
    const d = [`M${pts[0].x},${pts[0].y}`];
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
        d.push(`C${p1.x + (p2.x - p0.x) * tension},${cy(p1.y + (p2.y - p0.y) * tension)} ${p2.x - (p3.x - p1.x) * tension},${cy(p2.y - (p3.y - p1.y) * tension)} ${p2.x},${p2.y}`);
    }
    return d.join(" ");
}

// ── SVG Chart ─────────────────────────────────────────────────────────────────

function MultiSeriesChart({ data, groupBy, metric }: { data: TxChartData; groupBy: ChartGroupBy; metric: ChartMetric }) {
    const [active, setActive] = useState<number | null>(null);
    const uid = useId().replace(/:/g, "");
    const { labels, series } = data;
    const n = labels.length;
    const vals = (s: TxChartData["series"][number]) => metric === "VOLUME" ? s.volumes : s.counts;
    const rawMax = useMemo(() => Math.max(...series.flatMap(vals), 0), [series, metric]); // eslint-disable-line react-hooks/exhaustive-deps
    const { niceMax, ticks } = useMemo(() => niceTicks(rawMax), [rawMax]);
    const yFor = (v: number) => MT + IH - (v / niceMax) * IH;
    const xFor = (i: number) => ML + (n === 1 ? IW / 2 : (i / (n - 1)) * IW);
    const baseline = yFor(0);
    const pts = useMemo(() => series.map((s) => vals(s).map((v, i) => ({ x: xFor(i), y: yFor(v), value: v }))), [series, n, niceMax, metric]); // eslint-disable-line react-hooks/exhaustive-deps
    const xTicks = useMemo(() => {
        if (n <= 7) return labels.map((l, i) => ({ label: l, x: xFor(i) }));
        const step = Math.ceil(n / 6);
        return labels.map((l, i) => ({ label: l, i })).filter(({ i }) => i % step === 0 || i === n - 1).map(({ label, i }) => ({ label, x: xFor(i) }));
    }, [labels, n]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-[180px] sm:h-[260px]" preserveAspectRatio="none">
                <defs><clipPath id={uid}><rect x={ML} y={MT} width={IW} height={IH} /></clipPath></defs>
                {ticks.map((t) => {
                    const y = yFor(t);
                    return (
                        <g key={t}>
                            <line x1={ML} y1={y} x2={ML + IW} y2={y} stroke="currentColor" strokeWidth={t === 0 ? 1.2 : 0.6} strokeDasharray={t === 0 ? undefined : "4 4"} className={t === 0 ? "text-border" : "text-muted-foreground/25"} />
                            <text x={ML - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} className="fill-muted-foreground font-medium" style={{ fontFamily: "inherit" }}>{metric === "VOLUME" ? fmtVol(t) : t}</text>
                        </g>
                    );
                })}
                {active !== null && <line x1={xFor(active)} y1={MT} x2={xFor(active)} y2={baseline} stroke="currentColor" strokeWidth={0.8} strokeDasharray="4 3" className="text-muted-foreground/40" />}
                <g clipPath={`url(#${uid})`}>
                    {series.map((s, si) => <path key={s.key} d={smoothPath(pts[si], 0.1, MT, baseline)} fill="none" stroke={seriesColor(s.key, groupBy)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />)}
                </g>
                {active !== null && series.map((s, si) => {
                    const pt = pts[si]?.[active];
                    if (!pt) return null;
                    return <circle key={s.key} cx={pt.x} cy={Math.max(MT, Math.min(baseline, pt.y))} r="4" fill="white" stroke={seriesColor(s.key, groupBy)} strokeWidth="2.5" />;
                })}
                {xTicks.map(({ label, x }, i) => <text key={i} x={x} y={VB_H - 6} textAnchor="middle" fontSize={10.5} className="fill-muted-foreground" style={{ fontFamily: "inherit" }}>{label}</text>)}
                {Array.from({ length: n }).map((_, i) => {
                    const cx = xFor(i), zW = n === 1 ? IW : IW / (n - 1);
                    return <rect key={i} x={Math.max(ML, cx - zW / 2)} y={MT} width={Math.min(zW, ML + IW - Math.max(ML, cx - zW / 2))} height={IH} fill="transparent" className="cursor-crosshair" onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} />;
                })}
            </svg>

            {active !== null && (
                <div className="absolute pointer-events-none z-20" style={{ left: `${(xFor(active) / VB_W) * 100}%`, top: 0, transform: "translateX(-50%)" }}>
                    <div className="bg-popover border shadow-xl rounded-lg p-3 min-w-[156px] text-xs mt-2">
                        <p className="font-semibold text-foreground mb-2">{labels[active]}</p>
                        {series.map((s) => (
                            <div key={s.key} className="flex items-center justify-between gap-3 mt-0.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: seriesColor(s.key, groupBy) }} />
                                    <span className="text-muted-foreground">{s.key}</span>
                                </div>
                                <span className="font-bold text-foreground">
                                    {metric === "VOLUME" ? fmtVol(s.volumes[active] ?? 0) : (s.counts[active] ?? 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Intervalle UI ─────────────────────────────────────────────────────────────

type DisplayMode = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "YEAR" | "DAYS";

function displayToParams(mode: DisplayMode, year: number, from: string, to: string): TxChartParams {
    const groupBy: ChartGroupBy = "STATUS";
    switch (mode) {
        case "TODAY":      return { interval: "TODAY",      groupBy };
        case "THIS_WEEK":  return { interval: "THIS_WEEK",  groupBy };
        case "THIS_MONTH": return { interval: "THIS_MONTH", groupBy };
        case "YEAR":       return { interval: "CUSTOM", customType: "YEAR", year, groupBy };
        case "DAYS":       return { interval: "CUSTOM", customType: "DAYS", from: from || undefined, to: to || undefined, groupBy };
    }
}

// ── Composant principal ───────────────────────────────────────────────────────

interface TransactionsChartProps {
    mode?: "in" | "out";
}

export function TransactionsChart({ mode = "in" }: TransactionsChartProps) {
    const t = useTranslations("Dashboard.Transactions.Chart");

    const DISPLAY_OPTIONS: { value: DisplayMode; label: string }[] = [
        { value: "TODAY",      label: t("today") },
        { value: "THIS_WEEK",  label: t("thisWeek") },
        { value: "THIS_MONTH", label: t("thisMonth") },
        { value: "YEAR",       label: t("customYear") },
        { value: "DAYS",       label: t("customDays") },
    ];
    const GROUPBY_OPTIONS: { value: ChartGroupBy; label: string }[] = [
        { value: "STATUS",      label: t("groupStatus") },
        { value: "PROVIDER",    label: t("groupProvider") },
        { value: "APPLICATION", label: t("groupApplication") },
    ];
    const METRIC_OPTIONS: { value: ChartMetric; label: string }[] = [
        { value: "COUNT",  label: t("metricCount") },
        { value: "VOLUME", label: t("metricVolume") },
    ];

    const [displayMode,       setDisplayMode]       = useState<DisplayMode>("THIS_WEEK");
    const [groupBy,           setGroupBy]           = useState<ChartGroupBy>("STATUS");
    const [metric,            setMetric]            = useState<ChartMetric>("COUNT");
    const [customYear,        setCustomYear]        = useState<number>(new Date().getFullYear());
    const [customFrom,        setCustomFrom]        = useState("");
    const [customTo,          setCustomTo]          = useState("");
    const [periodMenuOpen,    setPeriodMenuOpen]    = useState(false);
    const [groupMenuOpen,     setGroupMenuOpen]     = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const mobileRef    = useRef<HTMLDivElement>(null);
    const periodBtnRef = useRef<HTMLButtonElement>(null);
    const periodDropRef = useRef<HTMLDivElement>(null);
    const groupBtnRef  = useRef<HTMLButtonElement>(null);
    const groupDropRef  = useRef<HTMLDivElement>(null);

    const params: TxChartParams = { ...displayToParams(displayMode, customYear, customFrom, customTo), groupBy };
    const { data, loading } = useTxChart(mode, params);

    const intervalLabel = DISPLAY_OPTIONS.find((o) => o.value === displayMode)?.label ?? displayMode;
    const groupByLabel  = GROUPBY_OPTIONS.find((o) => o.value === groupBy)?.label  ?? groupBy;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (periodMenuOpen && !periodDropRef.current?.contains(t) && !periodBtnRef.current?.contains(t))
                setPeriodMenuOpen(false);
            if (groupMenuOpen  && !groupDropRef.current?.contains(t)  && !groupBtnRef.current?.contains(t))
                setGroupMenuOpen(false);
            if (mobileRef.current && !mobileRef.current.contains(t))
                setMobileFiltersOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [periodMenuOpen, groupMenuOpen]);

    const needsCustomInput = displayMode === "YEAR" || displayMode === "DAYS";

    return (
        <div className="bg-card text-card-foreground rounded-xl border p-4 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-5">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate">{t("title")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                        {metric === "VOLUME" ? t("subtitleVolume") : t("subtitleCount")} · {intervalLabel} · {groupByLabel}
                    </p>
                </div>

                {/* Desktop controls */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {/* Metric toggle */}
                    <div className="flex bg-muted/50 p-0.5 rounded-lg border">
                        {METRIC_OPTIONS.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => setMetric(value)}
                                className={`text-xs h-7 px-3 rounded-md font-semibold transition-colors ${metric === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Period dropdown — inputs inside */}
                    <div className="relative">
                        <button ref={periodBtnRef} type="button"
                            className={`h-8 inline-flex items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${needsCustomInput ? "border-primary text-primary bg-primary/5" : "border-input bg-background text-foreground hover:bg-accent"}`}
                            onClick={() => { setPeriodMenuOpen((v) => !v); setGroupMenuOpen(false); }}>
                            {intervalLabel}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${periodMenuOpen ? "rotate-180" : ""}`} />
                        </button>
                        {periodMenuOpen && (
                            <div ref={periodDropRef} className="absolute right-0 mt-2 w-52 rounded-xl border bg-card shadow-xl z-50 p-1">
                                {DISPLAY_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button"
                                        className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-muted transition-colors ${displayMode === opt.value ? "text-primary" : "text-foreground"}`}
                                        onClick={() => {
                                            setDisplayMode(opt.value);
                                            if (opt.value !== "YEAR" && opt.value !== "DAYS") setPeriodMenuOpen(false);
                                        }}>
                                        {opt.label}
                                    </button>
                                ))}

                                {displayMode === "YEAR" && (
                                    <div className="px-2 pb-2 pt-2 border-t mt-1 space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">{t("yearInputLabel")}</p>
                                        <Input
                                            type="number" min={2020} max={new Date().getFullYear() + 1}
                                            value={customYear}
                                            onChange={(e) => setCustomYear(Number(e.target.value))}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )}

                                {displayMode === "DAYS" && (
                                    <div className="px-2 pb-2 pt-2 border-t mt-1 space-y-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">{t("fromInputLabel")}</p>
                                            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">{t("toInputLabel")}</p>
                                            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-sm" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* GroupBy dropdown */}
                    <div className="relative">
                        <button ref={groupBtnRef} type="button"
                            className="h-8 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                            onClick={() => { setGroupMenuOpen((v) => !v); setPeriodMenuOpen(false); }}>
                            {groupByLabel}
                            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${groupMenuOpen ? "rotate-180" : ""}`} />
                        </button>
                        {groupMenuOpen && (
                            <div ref={groupDropRef} className="absolute right-0 mt-2 w-44 rounded-xl border bg-card shadow-xl z-50 p-1">
                                {GROUPBY_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button"
                                        className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-muted transition-colors ${groupBy === opt.value ? "text-primary" : "text-foreground"}`}
                                        onClick={() => { setGroupBy(opt.value); setGroupMenuOpen(false); }}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile — bouton compact avec dropdown */}
                <div className="sm:hidden relative shrink-0" ref={mobileRef}>
                    <button type="button" onClick={() => setMobileFiltersOpen((v) => !v)}
                        className="h-8 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition-colors">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mobileFiltersOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border bg-card shadow-xl z-50 p-4 space-y-4">
                            {/* Metric */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("metricCount")} / {t("metricVolume")}</p>
                                <div className="flex bg-muted/50 p-1 rounded-lg border">
                                    {METRIC_OPTIONS.map(({ value, label }) => (
                                        <button key={value} type="button" onClick={() => setMetric(value as ChartMetric)}
                                            className={`flex-1 text-xs h-7 px-2 rounded-md font-semibold transition-colors ${metric === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Période */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("periodFilterLabel")}</p>
                                <div className="grid grid-cols-3 gap-1">
                                    {DISPLAY_OPTIONS.map(({ value, label }) => (
                                        <button key={value} type="button"
                                            onClick={() => setDisplayMode(value)}
                                            className={`text-xs h-7 px-1 rounded-md font-semibold border transition-colors truncate ${displayMode === value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:text-foreground"}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {displayMode === "YEAR" && (
                                    <Input
                                        type="number" min={2020} max={new Date().getFullYear() + 1}
                                        value={customYear}
                                        onChange={(e) => setCustomYear(Number(e.target.value))}
                                        className="h-8 text-sm mt-1"
                                    />
                                )}
                                {displayMode === "DAYS" && (
                                    <div className="space-y-1.5 mt-1">
                                        <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-sm" placeholder={t("fromInputLabel")} />
                                        <Input type="date" value={customTo}   onChange={(e) => setCustomTo(e.target.value)}   className="h-8 text-sm" placeholder={t("toInputLabel")} />
                                    </div>
                                )}
                            </div>

                            {/* Grouper par */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("groupFilterLabel")}</p>
                                <div className="flex bg-muted/50 p-1 rounded-lg border">
                                    {GROUPBY_OPTIONS.map(({ value, label }) => (
                                        <button key={value} type="button" onClick={() => setGroupBy(value as ChartGroupBy)}
                                            className={`flex-1 text-[11px] h-7 px-1 rounded-md font-semibold transition-colors truncate ${groupBy === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="button" onClick={() => setMobileFiltersOpen(false)}
                                className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                                {t("apply")}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Chart ───────────────────────────────────────────────────── */}
            {loading || !data ? (
                <div className="space-y-3">
                    <Skeleton className="h-[180px] sm:h-[260px] w-full rounded-lg" />
                    <div className="flex gap-3">{["w-20", "w-16", "w-14", "w-12"].map((w, i) => <Skeleton key={i} className={`h-3 ${w} rounded`} />)}</div>
                </div>
            ) : (
                <MultiSeriesChart data={data} groupBy={groupBy} metric={metric} />
            )}

            {/* ── Légende ─────────────────────────────────────────────────── */}
            {!loading && data && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 border-t">
                    {data.series.map((s) => (
                        <div key={s.key} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
                            <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seriesColor(s.key, groupBy) }} />
                            {s.key}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
