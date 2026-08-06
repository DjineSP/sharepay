"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ── CodeBlock ─────────────────────────────────────────────────────────────────

export function CodeBlock({ code, lang = "bash", title }: { code: string; lang?: string; title?: string }) {
    const [copied, setCopied] = React.useState(false);

    return (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title ?? lang}</span>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                </button>
            </div>
            <pre className="bg-zinc-950 px-4 py-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">
                <code className="text-zinc-300">{code}</code>
            </pre>
        </div>
    );
}

// ── MethodBadge ───────────────────────────────────────────────────────────────

export function MethodBadge({ method }: { method: "GET" | "POST" | "PATCH" | "DELETE" }) {
    const cls: Record<string, string> = {
        GET: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30",
        POST: "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30",
        PATCH: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30",
        DELETE: "bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/30",
    };
    return (
        <span className={cn("inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide shrink-0", cls[method])}>
            {method}
        </span>
    );
}

// ── EndpointHeader ────────────────────────────────────────────────────────────

export function EndpointHeader({ method, path, description, authTag }: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    description: string;
    authTag?: string;
}) {
    return (
        <div className="space-y-2 not-prose">
            <div className="flex items-center gap-3 flex-wrap">
                <MethodBadge method={method} />
                <code className="font-mono text-sm font-semibold bg-muted/60 px-3 py-1 rounded-lg border border-border/60 break-all">
                    {path}
                </code>
                {authTag && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-full ml-auto">
                        {authTag}
                    </span>
                )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

// ── FieldTable ────────────────────────────────────────────────────────────────

export interface DocField {
    name: string;
    type: string;
    required?: boolean;
    description: string;
    example?: string;
}

export function FieldTable({ fields, title }: { fields: DocField[]; title: string }) {
    return (
        <div className="space-y-2 not-prose">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
            <div className="border border-border rounded-xl overflow-hidden text-xs shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Field</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Type</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell">Required</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden lg:table-cell">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {fields.map((f) => (
                            <tr key={f.name} className="hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2.5 font-mono font-semibold text-foreground whitespace-nowrap">{f.name}</td>
                                <td className="px-3 py-2.5 font-mono text-primary whitespace-nowrap">{f.type}</td>
                                <td className="px-3 py-2.5 hidden sm:table-cell">
                                    {f.required
                                        ? <span className="text-red-500 dark:text-red-400 font-semibold">yes</span>
                                        : <span className="text-muted-foreground">no</span>}
                                </td>
                                <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell">
                                    {f.description}
                                    {f.example && <span className="ml-1.5 font-mono text-muted-foreground/70">e.g. {f.example}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Callout ───────────────────────────────────────────────────────────────────

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warning" | "danger"; title: string; children: React.ReactNode }) {
    const cls: Record<string, string> = {
        info: "bg-primary/5 border-primary text-foreground",
        warning: "bg-amber-500/10 border-amber-500 text-foreground",
        danger: "bg-red-500/10 border-red-500 text-foreground",
    };
    const titleCls: Record<string, string> = {
        info: "text-primary",
        warning: "text-amber-600 dark:text-amber-400",
        danger: "text-red-600 dark:text-red-400",
    };
    return (
        <div className={cn("rounded-lg border-l-4 p-4 shadow-sm not-prose", cls[tone])}>
            <p className={cn("text-xs font-bold uppercase tracking-wide mb-1", titleCls[tone])}>{title}</p>
            <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
    );
}

// ── StatusPill ────────────────────────────────────────────────────────────────

const STATUS_CLS: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    SUCCESS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    REFUNDED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export function StatusPill({ status }: { status: string }) {
    return (
        <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold", STATUS_CLS[status] ?? "bg-muted text-muted-foreground")}>
            {status}
        </span>
    );
}
