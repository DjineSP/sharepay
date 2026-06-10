"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { getCountries } from "react-phone-number-input";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

// ── Helpers ───────────────────────────────────────────────────────────────────

function flagEmoji(code: string): string {
    return code
        .toUpperCase()
        .replace(/./g, (c) =>
            String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
        );
}

function getCountryName(code: string, locale: string): string {
    try {
        return (
            new Intl.DisplayNames([locale, "en"], { type: "region" }).of(
                code.toUpperCase()
            ) ?? code
        );
    } catch {
        return code;
    }
}

/** Normalize any value coming from the backend to a clean alpha-2 code. */
function normalizeCode(raw: string): string {
    return raw.trim().toUpperCase().slice(0, 2);
}

const PRIORITY = [
    "CM", "CI", "SN", "TG", "BJ", "BF", "ML", "GN",
    "CD", "CG", "GA", "NE", "NG", "GH", "FR", "BE", "CH",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface CountryItem {
    code: string;
    name: string;
    flag: string;
}

interface CountrySelectProps {
    value:     string;
    onChange:  (code: string) => void;
    className?: string;
    disabled?:  boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CountrySelect({ value, onChange, className, disabled }: CountrySelectProps) {
    const locale = useLocale();

    const [open,   setOpen]   = useState(false);
    const [search, setSearch] = useState("");
    const containerRef        = useRef<HTMLDivElement>(null);
    const searchRef           = useRef<HTMLInputElement>(null);

    // Normalize incoming value so "cm", "CM", " CM " all match correctly
    const normalizedValue = value ? normalizeCode(value) : "";

    const allCountries = useMemo<CountryItem[]>(() => {
        return getCountries()
            .map((code) => ({
                code,
                name: getCountryName(code, locale),
                flag: flagEmoji(code),
            }))
            .sort((a, b) => a.name.localeCompare(b.name, locale));
    }, [locale]);

    const priorityList = useMemo(
        () =>
            PRIORITY.map((c) => allCountries.find((x) => x.code === c)).filter(
                Boolean
            ) as CountryItem[],
        [allCountries]
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return allCountries;
        const q = search.trim().toLowerCase();
        return allCountries.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q)
        );
    }, [allCountries, search]);

    const selected = allCountries.find((c) => c.code === normalizedValue);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Focus search on open, clear on close
    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
        else setSearch("");
    }, [open]);

    const select = (code: string) => {
        onChange(code);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    open && "ring-1 ring-ring"
                )}
            >
                <span className="flex items-center gap-2 truncate min-w-0">
                    {selected ? (
                        <>
                            <span className="text-base leading-none shrink-0">
                                {selected.flag}
                            </span>
                            <span className="truncate">{selected.name}</span>
                            <span className="text-muted-foreground text-xs shrink-0">
                                ({selected.code})
                            </span>
                        </>
                    ) : normalizedValue ? (
                        // Backend returned a code we don't recognise - show it raw
                        <span className="text-muted-foreground">{normalizedValue}</span>
                    ) : (
                        <span className="text-muted-foreground">Sélectionner un pays</span>
                    )}
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
                    {/* Search bar */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        {!search.trim() && (
                            <>
                                {priorityList.map((c) => (
                                    <CountryOption
                                        key={c.code}
                                        country={c}
                                        selected={normalizedValue === c.code}
                                        onSelect={select}
                                    />
                                ))}
                                <div className="my-1 h-px bg-border mx-1" />
                            </>
                        )}

                        {filtered.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Aucun résultat
                            </p>
                        ) : (
                            filtered.map((c) => (
                                <CountryOption
                                    key={c.code}
                                    country={c}
                                    selected={normalizedValue === c.code}
                                    onSelect={select}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Option item ───────────────────────────────────────────────────────────────

function CountryOption({
    country,
    selected,
    onSelect,
}: {
    country:  CountryItem;
    selected: boolean;
    onSelect: (code: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(country.code)}
            className={cn(
                "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selected && "bg-accent text-accent-foreground font-medium"
            )}
        >
            <span className="text-base leading-none w-5 shrink-0 text-center">
                {country.flag}
            </span>
            <span className="flex-1 text-left truncate">{country.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{country.code}</span>
            {selected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </button>
    );
}
