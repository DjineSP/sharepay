"use client";

import { useRef, useState, useMemo, useId, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionChart, ChartInterval, ChartGroupBy, TransactionChartData } from "@/features/merchant/dashboard";

type ChartMetric = "COUNT" | "VOLUME";

// ── Palette de couleurs ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    SUCCESS:   "#10b981",
    PENDING:   "#f59e0b",
    FAILED:    "#ef4444",
    CANCELLED: "#94a3b8",
    REFUNDED:  "#3b82f6",
};

const STATUS_LABELS: Record<string, string> = {
    SUCCESS:   "Succès",
    PENDING:   "En attente",
    FAILED:    "Échoué",
    CANCELLED: "Annulé",
    REFUNDED:  "Remboursé",
};

const PROVIDER_COLORS: Record<string, string> = {
    "MTN Mobile Money Cameroun":   "#fbbf24",
    "Orange Money Cameroun":       "#f97316",
};

const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#14b8a6"];

function hashPaletteColor(key: string): string {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
    return PALETTE[Math.abs(h) % PALETTE.length];
}

function getSeriesColor(key: string, groupBy: ChartGroupBy): string {
    if (groupBy === "STATUS")   return STATUS_COLORS[key]   ?? hashPaletteColor(key);
    if (groupBy === "PROVIDER") return PROVIDER_COLORS[key] ?? hashPaletteColor(key);
    return hashPaletteColor(key);
}

function getSeriesLabel(key: string, groupBy: ChartGroupBy): string {
    if (groupBy === "STATUS") return STATUS_LABELS[key] ?? key;
    return key;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtVolume(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${Math.round(v / 1_000)}k`;
    return String(v);
}

// ── SVG layout constants ──────────────────────────────────────────────────────

const VB_W  = 1060;
const VB_H  = 310;
const ML    = 52;   // left margin (Y-axis labels)
const MR    = 16;
const MT    = 14;
const MB    = 38;   // bottom margin (X-axis labels)
const IW    = VB_W - ML - MR;  // inner width  = 992
const IH    = VB_H - MT - MB;  // inner height = 258

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeNiceTicks(rawMax: number, tickCount = 5): { niceMax: number; ticks: number[] } {
    if (rawMax === 0) return { niceMax: 10, ticks: [0, 2, 4, 6, 8, 10] };
    const rawStep = rawMax / (tickCount - 1);
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    // Round to avoid float drift (e.g. 3 * 0.1 = 0.30000000000000004), and enforce min step of 1
    const niceStep = Math.max(1, Math.round(Math.ceil(rawStep / mag) * mag));
    const niceMax  = niceStep * (tickCount - 1);
    return { niceMax, ticks: Array.from({ length: tickCount }, (_, i) => i * niceStep) };
}

function buildSmoothPath(
    pts: { x: number; y: number }[],
    tension = 0.1,
    yMin = -Infinity,
    yMax = Infinity,
): string {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
    const cy = (y: number) => Math.max(yMin, Math.min(yMax, y));
    const d: string[] = [`M${pts[0].x},${pts[0].y}`];
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = cy(p1.y + (p2.y - p0.y) * tension);
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = cy(p2.y - (p3.y - p1.y) * tension);
        d.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
    }
    return d.join(" ");
}

// ── Sous-composant : rendu du SVG multi-séries ────────────────────────────────

function MultiSeriesChart({ data, groupBy, metric }: { data: TransactionChartData; groupBy: ChartGroupBy; metric: ChartMetric }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const uid = useId().replace(/:/g, "");
    const clipId = `chart-clip-${uid}`;

    const { labels, series } = data;
    const n = labels.length;

    const values = (s: TransactionChartData["series"][number]) =>
        metric === "VOLUME" ? s.volumes : s.counts;

    const rawMax = useMemo(
        () => Math.max(...series.flatMap((s) => values(s)), 0),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [series, metric],
    );
    const { niceMax, ticks: yTicks } = useMemo(() => computeNiceTicks(rawMax), [rawMax]);

    // Convert value → SVG Y coordinate (within inner area)
    const yFor = (v: number) => MT + IH - (v / niceMax) * IH;
    // Convert index → SVG X coordinate (within inner area)
    const xFor = (i: number) => ML + (n === 1 ? IW / 2 : (i / (n - 1)) * IW);

    const seriesPoints = useMemo(
        () => series.map((s) => values(s).map((v, i) => ({ x: xFor(i), y: yFor(v), value: v }))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [series, n, niceMax, metric],
    );

    // X-labels: max 7 ticks, as % of inner width offset by left margin
    const xTicks = useMemo(() => {
        if (n <= 7) return labels.map((l, i) => ({ label: l, x: xFor(i) }));
        const step = Math.ceil(n / 6);
        return labels
            .map((l, i) => ({ label: l, i }))
            .filter(({ i }) => i % step === 0 || i === n - 1)
            .map(({ label, i }) => ({ label, x: xFor(i) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labels, n]);

    const baseline = yFor(0);

    return (
        <div className="relative w-full">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="w-full h-[180px] sm:h-[260px]"
                preserveAspectRatio="none"
            >
                <defs>
                    <clipPath id={clipId}>
                        <rect x={ML} y={MT} width={IW} height={IH} />
                    </clipPath>
                </defs>

                {/* Grid lines + Y-axis ticks */}
                {yTicks.map((tick) => {
                    const y = yFor(tick);
                    const isBaseline = tick === 0;
                    return (
                        <g key={tick}>
                            <line
                                x1={ML} y1={y} x2={ML + IW} y2={y}
                                stroke={isBaseline ? "currentColor" : "currentColor"}
                                strokeWidth={isBaseline ? 1.2 : 0.6}
                                strokeDasharray={isBaseline ? undefined : "4 4"}
                                className={isBaseline ? "text-border" : "text-muted-foreground/25"}
                            />
                            <text
                                x={ML - 8}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize={11}
                                className="fill-muted-foreground font-medium"
                                style={{ fontFamily: "inherit" }}
                            >
                                {metric === "VOLUME" ? fmtVolume(tick) : tick}
                            </text>
                        </g>
                    );
                })}

                {/* Vertical hover line */}
                {activeIndex !== null && (
                    <line
                        x1={xFor(activeIndex)} y1={MT}
                        x2={xFor(activeIndex)} y2={baseline}
                        stroke="currentColor"
                        strokeWidth={0.8}
                        strokeDasharray="4 3"
                        className="text-muted-foreground/40"
                    />
                )}

                {/* Series curves - clipped to chart area */}
                <g clipPath={`url(#${clipId})`}>
                    {series.map((s, si) => {
                        const pts = seriesPoints[si];
                        const color = getSeriesColor(s.key, groupBy);
                        return (
                            <g key={s.key}>
                                <path
                                    d={buildSmoothPath(pts, 0.1, MT, baseline)}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.9"
                                />
                            </g>
                        );
                    })}
                </g>

                {/* Hover dots (outside clip so they aren't cut off at baseline) */}
                {activeIndex !== null && series.map((s, si) => {
                    const pt = seriesPoints[si]?.[activeIndex];
                    if (!pt) return null;
                    return (
                        <circle
                            key={s.key}
                            cx={pt.x}
                            cy={Math.max(MT, Math.min(baseline, pt.y))}
                            r="4"
                            fill="white"
                            stroke={getSeriesColor(s.key, groupBy)}
                            strokeWidth="2.5"
                        />
                    );
                })}

                {/* X-axis labels */}
                {xTicks.map(({ label, x }, i) => (
                    <text
                        key={i}
                        x={x}
                        y={VB_H - 6}
                        textAnchor="middle"
                        fontSize={10.5}
                        className="fill-muted-foreground"
                        style={{ fontFamily: "inherit" }}
                    >
                        {label}
                    </text>
                ))}

                {/* Invisible interaction zones */}
                {Array.from({ length: n }).map((_, i) => {
                    const cx = xFor(i);
                    const zoneW = n === 1 ? IW : IW / (n - 1);
                    return (
                        <rect
                            key={i}
                            x={Math.max(ML, cx - zoneW / 2)}
                            y={MT}
                            width={Math.min(zoneW, ML + IW - Math.max(ML, cx - zoneW / 2))}
                            height={IH}
                            fill="transparent"
                            className="cursor-crosshair"
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                        />
                    );
                })}
            </svg>

            {/* Tooltip (HTML overlay) */}
            {activeIndex !== null && (
                <div
                    className="absolute pointer-events-none z-20"
                    style={{
                        left: `${(xFor(activeIndex) / VB_W) * 100}%`,
                        top: 0,
                        transform: "translateX(-50%)",
                    }}
                >
                    <div className="bg-popover border shadow-xl rounded-lg p-3 min-w-[148px] text-xs mt-2">
                        <p className="font-semibold text-foreground mb-2">{labels[activeIndex]}</p>
                        {series.map((s) => (
                            <div key={s.key} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block w-2 h-2 rounded-full shrink-0"
                                        style={{ background: getSeriesColor(s.key, groupBy) }}
                                    />
                                    <span className="text-muted-foreground">{getSeriesLabel(s.key, groupBy)}</span>
                                </div>
                                <span className="font-bold text-foreground">
                                    {metric === "VOLUME"
                                        ? fmtVolume(s.volumes[activeIndex] ?? 0)
                                        : (s.counts[activeIndex] ?? 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function OverviewTransactionChartCard() {
    const t = useTranslations("Dashboard.Chart");

    const INTERVAL_OPTIONS: { value: ChartInterval; label: string }[] = [
        { value: "TODAY",        label: t("today") },
        { value: "LAST_7_DAYS",  label: t("last7Days") },
        { value: "LAST_30_DAYS", label: t("last30Days") },
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

    const [interval,          setInterval]          = useState<ChartInterval>("LAST_7_DAYS");
    const [groupBy,           setGroupBy]           = useState<ChartGroupBy>("STATUS");
    const [metric,            setMetric]            = useState<ChartMetric>("COUNT");
    const [periodMenuOpen,    setPeriodMenuOpen]    = useState(false);
    const [groupMenuOpen,     setGroupMenuOpen]     = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const rootRef   = useRef<HTMLDivElement>(null);
    const mobileRef = useRef<HTMLDivElement>(null);

    const { data, loading } = useTransactionChart(interval, groupBy);
    const currency      = data?.currency ?? "XAF";
    const groupByLabel  = GROUPBY_OPTIONS.find((o) => o.value === groupBy)?.label  ?? groupBy;
    const intervalLabel = INTERVAL_OPTIONS.find((o) => o.value === interval)?.label ?? interval;

    // Fermer tous les dropdowns au clic extérieur
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setPeriodMenuOpen(false);
                setGroupMenuOpen(false);
            }
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
                setMobileFiltersOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const ToggleGroup = ({ options, active, onChange }: {
        options: { value: string; label: string }[];
        active: string;
        onChange: (v: string) => void;
    }) => (
        <div className="flex bg-muted/50 p-1 rounded-lg border w-full">
            {options.map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={`flex-1 text-xs h-7 px-2 rounded-md font-semibold transition-colors ${
                        active === value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="xl:col-span-2 bg-card text-card-foreground rounded-xl border p-4 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-5" ref={rootRef}>

            {/* En-tête */}
            <div>
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate min-w-0">{t("title")}</h3>

                {/* ── Mobile : bouton Filtres ── */}
                <div className="sm:hidden relative shrink-0" ref={mobileRef}>
                    <button
                        type="button"
                        onClick={() => setMobileFiltersOpen((v) => !v)}
                        className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="max-w-[110px] truncate">{intervalLabel} · {groupByLabel}</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} />
                    </button>

                    {mobileFiltersOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-card shadow-xl z-50 p-4 space-y-4">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filterMetricLabel")}</p>
                                <ToggleGroup options={METRIC_OPTIONS} active={metric} onChange={(v) => setMetric(v as ChartMetric)} />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filterIntervalLabel")}</p>
                                <ToggleGroup options={INTERVAL_OPTIONS} active={interval} onChange={(v) => setInterval(v as ChartInterval)} />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filterGroupLabel")}</p>
                                <ToggleGroup options={GROUPBY_OPTIONS} active={groupBy} onChange={(v) => { setGroupBy(v as ChartGroupBy); setMobileFiltersOpen(false); }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Tablette / Desktop : contrôles inline ── */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 shrink-0">
                    {/* Métrique */}
                    <div className="flex bg-muted/50 p-1 rounded-lg border">
                        {METRIC_OPTIONS.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => setMetric(value)}
                                className={`text-xs h-7 px-3 rounded-md font-semibold transition-colors ${
                                    metric === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}>{label}</button>
                        ))}
                    </div>
                    {/* Période - dropdown */}
                    <div className="relative">
                        <button type="button"
                            className="h-9 inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
                            onClick={() => { setPeriodMenuOpen((v) => !v); setGroupMenuOpen(false); }}
                        >
                            {intervalLabel}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {periodMenuOpen && (
                            <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-card shadow-lg z-50 overflow-hidden">
                                {INTERVAL_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button"
                                        className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors ${
                                            interval === opt.value ? "text-primary" : "text-foreground"
                                        }`}
                                        onClick={() => { setInterval(opt.value); setPeriodMenuOpen(false); }}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Grouper par - dropdown */}
                    <div className="relative">
                        <button type="button"
                            className="h-9 inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
                            onClick={() => { setGroupMenuOpen((v) => !v); setPeriodMenuOpen(false); }}>
                            {groupByLabel}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {groupMenuOpen && (
                            <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-card shadow-lg z-50 overflow-hidden">
                                {GROUPBY_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button"
                                        className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors ${
                                            groupBy === opt.value ? "text-primary" : "text-foreground"
                                        }`}
                                        onClick={() => { setGroupBy(opt.value); setGroupMenuOpen(false); }}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {metric === "VOLUME" ? t("subtitleVolume", { currency }) : t("subtitleCount")} · {intervalLabel} · {groupByLabel}
                </p>
            </div>

            {/* Chart ou skeleton */}
            {loading || !data ? (
                <div className="space-y-3">
                    <Skeleton className="h-[180px] sm:h-[260px] w-full rounded-lg" />
                    <div className="flex gap-3">
                        {["w-20", "w-16", "w-14", "w-12"].map((w, i) => (
                            <Skeleton key={i} className={`h-3 ${w} rounded`} />
                        ))}
                    </div>
                </div>
            ) : (
                <MultiSeriesChart data={data} groupBy={groupBy} metric={metric} />
            )}

            {/* Légende */}
            {!loading && data && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 border-t">
                    {data.series.map((s) => (
                        <div key={s.key} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
                            <span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm shrink-0"
                                style={{ background: getSeriesColor(s.key, groupBy) }} />
                            {getSeriesLabel(s.key, groupBy)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
