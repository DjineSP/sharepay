"use client";

import * as React from "react";
import { Copy, Check, Play, AlertCircle, Clock, Eye, EyeOff, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Env      = "simulation" | "live";
type FieldType = "text" | "number" | "select";

interface EndpointField {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    hint?: string;
    options?: string[];
    defaultValue?: string;
}

interface Endpoint {
    id: string;
    method: "GET" | "POST";
    path: string;
    label: string;
    category: string;
    description: string;
    fields: EndpointField[];
    buildResponse: (values: Record<string, string>) => object;
    statusCode: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ref   = () => `PI-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
const poRef = () => `PO-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
const now   = () => new Date().toISOString();

// ── Endpoint definitions ──────────────────────────────────────────────────────

const ENDPOINTS: Endpoint[] = [
    {
        id: "payin-checkout",
        method: "POST",
        path: "/api/v1/pay-in/checkout",
        label: "Checkout",
        category: "Pay-In",
        description: "Créer une session de paiement web (30 min)",
        fields: [
            { name: "amount",            label: "Montant",            type: "number", required: true,  placeholder: "5000",                      hint: "En unité de base (XAF)" },
            { name: "currency",          label: "Devise",             type: "select", required: true,  options: ["XAF"],                          defaultValue: "XAF" },
            { name: "merchantReference", label: "Référence marchand", type: "text",                    placeholder: "CMD-2024-001" },
            { name: "description",       label: "Description",        type: "text",                    placeholder: "Paiement commande #001" },
            { name: "successUrl",        label: "URL de succès",      type: "text",                    placeholder: "https://mon-site.cm/success" },
            { name: "cancelUrl",         label: "URL d'annulation",   type: "text",                    placeholder: "https://mon-site.cm/cancel" },
        ],
        statusCode: 201,
        buildResponse: (v) => ({
            success: true, code: "CHECKOUT_CREATED", message: "Session de paiement créée.",
            data: {
                reference: ref(), status: "PENDING",
                amount: Number(v.amount) || 5000, currency: v.currency || "XAF",
                ...(v.description && { description: v.description }),
                paymentUrl: `https://checkout.sharepay.cm/pay/cs_${Math.random().toString(36).substring(2, 14)}`,
            },
            timestamp: now(),
        }),
    },
    {
        id: "payin-charge",
        method: "POST",
        path: "/api/v1/pay-in/charge",
        label: "Charge directe",
        category: "Pay-In",
        description: "Paiement direct sans page web intermédiaire",
        fields: [
            { name: "amount",            label: "Montant",            type: "number", required: true, placeholder: "5000" },
            { name: "currency",          label: "Devise",             type: "select", required: true, options: ["XAF"],                           defaultValue: "XAF" },
            { name: "paymentMethod",     label: "Provider",           type: "select", required: true, options: ["MTN_MOMO_CM", "ORANGE_MONEY_CM"], defaultValue: "MTN_MOMO_CM" },
            { name: "payerAccount",      label: "Numéro payeur",      type: "text",   required: true, placeholder: "237690000000" },
            { name: "payerName",         label: "Nom payeur",         type: "text",                   placeholder: "Jean Dupont" },
            { name: "payerEmail",        label: "Email payeur",       type: "text",                   placeholder: "jean@exemple.com" },
            { name: "merchantReference", label: "Référence marchand", type: "text",                   placeholder: "CMD-2024-001" },
            { name: "idempotencyKey",    label: "Clé d'idempotence",  type: "text",                   placeholder: "idem-001-v1", hint: "Évite les doublons" },
        ],
        statusCode: 201,
        buildResponse: (v) => ({
            success: true, code: "PAYMENT_INITIATED", message: "Paiement initié.",
            data: {
                reference: ref(), status: "PROCESSING",
                amount: Number(v.amount) || 5000, currency: v.currency || "XAF",
                paymentMethod: v.paymentMethod || "MTN_MOMO_CM",
                payerAccount: v.payerAccount || "237690000000",
                ...(v.payerName  && { payerName: v.payerName }),
                ...(v.payerEmail && { payerEmail: v.payerEmail }),
            },
            timestamp: now(),
        }),
    },
    {
        id: "payin-status",
        method: "GET",
        path: "/api/v1/pay-in/check_status/{reference}",
        label: "Statut",
        category: "Pay-In",
        description: "Vérifier le statut d'une transaction entrante",
        fields: [
            { name: "reference", label: "Référence", type: "text", required: true, placeholder: "PI-A1B2C3D4E5F6", hint: "Retournée à la création" },
        ],
        statusCode: 200,
        buildResponse: (v) => ({
            success: true, code: "OK",
            data: {
                reference: v.reference || "PI-A1B2C3D4E5F6", type: "CHARGE", status: "SUCCESS",
                amount: 5000, currency: "XAF", paymentMethod: "MTN_MOMO_CM",
                payerAccount: "237690000000", payerName: "Jean Dupont",
            },
            timestamp: now(),
        }),
    },
    {
        id: "payout-transfer",
        method: "POST",
        path: "/api/v1/pay-out/transfer",
        label: "Virement",
        category: "Pay-Out",
        description: "Initier un virement vers un bénéficiaire",
        fields: [
            { name: "amount",             label: "Montant",                type: "number", required: true, placeholder: "10000" },
            { name: "currency",           label: "Devise",                 type: "select", required: true, options: ["XAF"], defaultValue: "XAF" },
            { name: "paymentMethod",      label: "Provider",               type: "select", required: true, options: ["MTN_MOMO_CM", "ORANGE_MONEY_CM"], defaultValue: "MTN_MOMO_CM" },
            { name: "beneficiaryAccount", label: "Téléphone bénéficiaire", type: "text",   required: true, placeholder: "237690000000" },
            { name: "beneficiaryName",    label: "Nom bénéficiaire",       type: "text",   required: true, placeholder: "Marie Martin" },
            { name: "beneficiaryEmail",   label: "Email bénéficiaire",     type: "text",                   placeholder: "marie@exemple.com" },
            { name: "merchantReference",  label: "Référence marchand",     type: "text",                   placeholder: "PAYOUT-2024-001" },
            { name: "description",        label: "Description",            type: "text",                   placeholder: "Remboursement client #001" },
        ],
        statusCode: 201,
        buildResponse: (v) => ({
            success: true, code: "PAYOUT_INITIATED", message: "Virement initié.",
            data: {
                reference: poRef(), status: "PROCESSING",
                amount: Number(v.amount) || 10000, currency: v.currency || "XAF",
                paymentMethod: v.paymentMethod || "MTN_MOMO_CM",
                beneficiaryAccount: v.beneficiaryAccount || "237690000000",
                beneficiaryName: v.beneficiaryName || "Marie Martin",
                ...(v.beneficiaryEmail && { beneficiaryEmail: v.beneficiaryEmail }),
            },
            timestamp: now(),
        }),
    },
    {
        id: "payout-status",
        method: "GET",
        path: "/api/v1/pay-out/check_status/{reference}",
        label: "Statut",
        category: "Pay-Out",
        description: "Vérifier le statut d'un payout",
        fields: [
            { name: "reference", label: "Référence", type: "text", required: true, placeholder: "PO-A1B2C3D4E5F6", hint: "Retournée à la création" },
        ],
        statusCode: 200,
        buildResponse: (v) => ({
            success: true, code: "OK",
            data: {
                reference: v.reference || "PO-A1B2C3D4E5F6", status: "SUCCESS",
                amount: 10000, currency: "XAF", paymentMethod: "MTN_MOMO_CM",
                beneficiaryAccount: "237690000000", beneficiaryName: "Marie Martin",
            },
            timestamp: now(),
        }),
    },
];

const CATEGORIES = [...new Set(ENDPOINTS.map((e) => e.category))];

const CAT_COLORS: Record<string, string> = {
    "Pay-In":  "text-emerald-500 dark:text-emerald-400",
    "Pay-Out": "text-violet-500 dark:text-violet-400",
};

// ── JSON viewer with line numbers ─────────────────────────────────────────────

function JsonLine({ text }: { text: string }) {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const highlighted = escaped
        .replace(/"([^"]+)":/g,         '<span class="text-sky-400">"$1"</span>:')
        .replace(/: "([^"]+)"/g,        ': <span class="text-emerald-400">"$1"</span>')
        .replace(/: (true|false)/g,     ': <span class="text-amber-400">$1</span>')
        .replace(/: (null)/g,           ': <span class="text-zinc-500">$1</span>')
        .replace(/: (\d+(?:\.\d+)?)/g, ': <span class="text-violet-400">$1</span>');
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

function JsonViewer({ json }: { json: object }) {
    const lines = JSON.stringify(json, null, 2).split("\n");
    return (
        <div className="flex text-xs font-mono leading-relaxed">
            <div className="select-none text-right pr-3 border-r border-white/5 text-zinc-600 shrink-0 min-w-[2rem]">
                {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre className="pl-3 text-zinc-300 flex-1 overflow-x-auto">
                {lines.map((line, i) => <div key={i}><JsonLine text={line} /></div>)}
            </pre>
        </div>
    );
}

// ── cURL viewer ────────────────────────────────────────────────────────────────

function CurlViewer({ curl }: { curl: string }) {
    const highlighted = React.useMemo(() => {
        const escaped = curl.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return escaped
            .replace(/^curl/, '<span class="text-sky-400 font-semibold">curl</span>')
            .replace(/(-X\s+)(GET|POST)/g, '$1<span class="text-amber-400 font-semibold">$2</span>')
            .replace(/"(https?:\/\/[^"]+)"/, '"<span class="text-emerald-400">$1</span>"')
            .replace(/-H "([^"]+)"/g,       '-H "<span class="text-violet-400">$1</span>"')
            .replace(/(-d\s+)([\s\S]+)$/,   '<span class="text-zinc-500">$1</span><span class="text-orange-400">$2</span>');
    }, [curl]);
    return (
        <pre
            className="text-[11px] font-mono leading-relaxed text-zinc-400 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: highlighted }}
        />
    );
}

// ── Field renderer ─────────────────────────────────────────────────────────────

function FieldInput({
    field, value, onChange, error,
}: {
    field: EndpointField;
    value: string;
    onChange: (v: string) => void;
    error?: boolean;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <label className="text-xs font-semibold text-foreground truncate">{field.label}</label>
                    {field.required && (
                        <span className="shrink-0 text-[9px] font-bold text-red-500 bg-red-500/10 px-1 py-px rounded">REQ</span>
                    )}
                </div>
                {field.hint && <span className="shrink-0 text-[10px] text-muted-foreground">{field.hint}</span>}
            </div>
            {field.type === "select" ? (
                <Select value={value || field.defaultValue || ""} onValueChange={onChange}>
                    <SelectTrigger className={cn("h-8 text-xs", error && "border-red-500")}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={cn("h-8 text-xs", error && "border-red-500 focus-visible:ring-red-500")}
                />
            )}
        </div>
    );
}

// ── cURL builder ──────────────────────────────────────────────────────────────

function buildCurl(endpoint: Endpoint, apiKey: string, values: Record<string, string>): string {
    const baseUrl = (process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm").replace(/\/api\/v1$/, "");
    const path = endpoint.path.replace("{reference}", values.reference || "{reference}");
    const key = apiKey || "sk_live_votre_cle";

    if (endpoint.method === "GET") {
        return `curl -X GET "${baseUrl}${path}" \\\n  -H "X-API-KEY: ${key}"`;
    }

    const body: Record<string, unknown> = {};
    endpoint.fields.forEach((f) => {
        const v = values[f.name] || f.defaultValue || "";
        if (v) body[f.name] = f.type === "number" ? Number(v) : v;
    });

    return (
        `curl -X POST "${baseUrl}${path}" \\\n` +
        `  -H "Content-Type: application/json" \\\n` +
        `  -H "X-API-KEY: ${key}" \\\n` +
        `  -d '${JSON.stringify(body, null, 2)}'`
    );
}

// ── MethodBadge ───────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: "GET" | "POST" }) {
    return (
        <span className={cn(
            "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0",
            method === "GET"
                ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30",
        )}>
            {method}
        </span>
    );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ code }: { code: number }) {
    const ok = code >= 200 && code < 300;
    const isNetErr = code === 0;
    const dotCls = isNetErr ? "bg-zinc-500" : ok ? "bg-emerald-500" : "bg-red-500";
    const textCls = isNetErr ? "text-zinc-400" : ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
    const label = isNetErr ? "Réseau" : ok ? "OK" : "Erreur";
    return (
        <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", dotCls)} />
            <span className={cn("text-xs font-bold", textCls)}>
                {code > 0 ? `${code} ` : ""}{label}
            </span>
        </div>
    );
}

// ── EnvToggle ─────────────────────────────────────────────────────────────────

function EnvToggle({ env, onChange }: { env: Env; onChange: (e: Env) => void }) {
    return (
        <div className="flex items-center gap-1 bg-muted/60 rounded-full p-0.5 border">
            {(["simulation", "live"] as Env[]).map((e) => (
                <button
                    key={e}
                    onClick={() => onChange(e)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all",
                        env === e
                            ? e === "live"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-amber-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    {env === e && e === "live" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                    )}
                    {e === "live" ? "Live" : "Simulation"}
                </button>
            ))}
        </div>
    );
}

// ── EndpointList ──────────────────────────────────────────────────────────────

function EndpointList({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
    return (
        <div className="py-5 px-2 space-y-5">
            {CATEGORIES.map((cat) => (
                <div key={cat}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider px-2 mb-1.5", CAT_COLORS[cat] ?? "text-muted-foreground")}>
                        {cat}
                    </p>
                    <ul className="space-y-0.5">
                        {ENDPOINTS.filter((e) => e.category === cat).map((e) => (
                            <li key={e.id}>
                                <button
                                    onClick={() => onSelect(e.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2.5 rounded-md transition-colors",
                                        selectedId === e.id
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <MethodBadge method={e.method} />
                                        <span className="text-xs font-semibold truncate">{e.label}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

// ── RequestPanel ──────────────────────────────────────────────────────────────

interface RequestPanelProps {
    env: Env;
    endpoint: Endpoint;
    apiKey: string;
    onApiKeyChange: (v: string) => void;
    showApiKey: boolean;
    onToggleShowApiKey: () => void;
    values: Record<string, string>;
    fieldErrors: Set<string>;
    onFieldChange: (name: string, val: string) => void;
    onExecute: () => void;
    loading: boolean;
    onReset: () => void;
}

function RequestPanel({
    env, endpoint, apiKey, onApiKeyChange, showApiKey, onToggleShowApiKey,
    values, fieldErrors, onFieldChange, onExecute, loading, onReset,
}: RequestPanelProps) {
    return (
        <div className="h-full flex flex-col gap-5">
            {/* Endpoint header */}
            <div className="space-y-2 pb-4 border-b border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                    <MethodBadge method={endpoint.method} />
                    <code className="flex-1 min-w-0 truncate text-xs font-mono font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg border">
                        {endpoint.path}
                    </code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{endpoint.description}</p>
            </div>

            {/* Live mode banner */}
            {env === "live" && (
                <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5">
                    <span className="mt-px h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        <strong>Mode Live</strong> - les requêtes sont envoyées à l'API réelle.
                        La clé API est obligatoire.
                    </p>
                </div>
            )}

            {/* API Key */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Clé API {env === "live" && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                    <Input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        placeholder="sk_live_votre_cle_api"
                        className={cn(
                            "h-8 text-xs font-mono pr-8",
                            env === "live" && !apiKey && "border-amber-500/50 focus-visible:ring-amber-500",
                        )}
                    />
                    <button
                        type="button"
                        onClick={onToggleShowApiKey}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                    >
                        {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Gérez vos clés dans{" "}
                    <a href="/merchant/apps" className="text-primary hover:underline">Applications</a>.
                </p>
            </div>

            {/* Fields */}
            {endpoint.fields.length > 0 && (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paramètres</p>
                    {endpoint.fields.map((field) => (
                        <FieldInput
                            key={field.name}
                            field={field}
                            value={values[field.name] || ""}
                            onChange={(v) => onFieldChange(field.name, v)}
                            error={fieldErrors.has(field.name)}
                        />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="shrink-0 space-y-3">
                <div className="flex gap-2">
                    <Button onClick={onExecute} disabled={loading} className="flex-1 gap-2" size="sm">
                        {loading ? (
                            <>
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                {env === "live" ? "Envoi…" : "Exécution…"}
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5" />
                                {env === "live" ? "Envoyer" : "Exécuter"}
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={onReset} title="Réinitialiser" className="px-3">
                        <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                    Raccourci :{" "}
                    <kbd className="bg-muted border rounded px-1 py-px font-mono text-[10px]">Ctrl</kbd>
                    {" + "}
                    <kbd className="bg-muted border rounded px-1 py-px font-mono text-[10px]">Enter</kbd>
                </p>
            </div>
        </div>
    );
}

// ── CurlPanel ─────────────────────────────────────────────────────────────────

function CurlPanel({ curl, copied, onCopy }: { curl: string; copied: boolean; onCopy: () => void }) {
    return (
        <div className="rounded-xl overflow-hidden border border-border/50">
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">cURL</span>
                <button
                    onClick={onCopy}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copié !" : "Copier"}</span>
                </button>
            </div>
            <div className="bg-zinc-950 px-3 py-3 max-h-36 overflow-auto">
                <CurlViewer curl={curl} />
            </div>
        </div>
    );
}

// ── ResponsePanel ─────────────────────────────────────────────────────────────

interface ResponsePanelProps {
    response: object | null;
    statusCode: number | null;
    responseTime: number | null;
    copied: boolean;
    onCopy: () => void;
    env: Env;
}

function ResponsePanel({ response, statusCode, responseTime, copied, onCopy, env }: ResponsePanelProps) {
    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between shrink-0 pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Réponse</p>
                    {statusCode !== null && <StatusBadge code={statusCode} />}
                    {responseTime !== null && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {responseTime} ms
                        </span>
                    )}
                    {env === "live" && response && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Live
                        </span>
                    )}
                </div>
                {response && (
                    <button
                        onClick={onCopy}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copié !" : "Copier JSON"}
                    </button>
                )}
            </div>

            <div className="flex-1 rounded-xl border overflow-hidden">
                {response ? (
                    <div className="h-full bg-zinc-950 px-4 py-4 overflow-auto">
                        <JsonViewer json={response} />
                    </div>
                ) : (
                    <div className="h-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-800/60 border border-white/5 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-zinc-600" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-semibold text-zinc-500">Aucune réponse</p>
                            <p className="text-xs text-zinc-600 max-w-[200px] leading-relaxed">
                                Remplissez les paramètres et cliquez sur{" "}
                                <span className="text-zinc-500 font-medium">{env === "live" ? "Envoyer" : "Exécuter"}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                            <kbd className="bg-zinc-800 border border-white/5 rounded px-1.5 py-0.5 font-mono">Ctrl</kbd>
                            <span>+</span>
                            <kbd className="bg-zinc-800 border border-white/5 rounded px-1.5 py-0.5 font-mono">Enter</kbd>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ApiLabPage() {
    const [env,            setEnv]           = React.useState<Env>("simulation");
    const [selectedId,     setSelectedId]    = React.useState(ENDPOINTS[0].id);
    const [apiKey,         setApiKey]        = React.useState("");
    const [showApiKey,     setShowApiKey]    = React.useState(false);
    const [values,         setValues]        = React.useState<Record<string, string>>({});
    const [fieldErrors,    setFieldErrors]   = React.useState<Set<string>>(new Set());
    const [response,       setResponse]      = React.useState<object | null>(null);
    const [statusCode,     setStatusCode]    = React.useState<number | null>(null);
    const [loading,        setLoading]       = React.useState(false);
    const [responseTime,   setResponseTime]  = React.useState<number | null>(null);
    const [copiedCurl,     setCopiedCurl]    = React.useState(false);
    const [copiedResponse, setCopiedResponse] = React.useState(false);
    const [mobileTab,      setMobileTab]     = React.useState<"request" | "response">("request");

    const endpoint = ENDPOINTS.find((e) => e.id === selectedId)!;

    React.useEffect(() => {
        const defaults: Record<string, string> = {};
        endpoint.fields.forEach((f) => { if (f.defaultValue) defaults[f.name] = f.defaultValue; });
        setValues(defaults);
        setFieldErrors(new Set());
        setResponse(null);
        setStatusCode(null);
        setResponseTime(null);
    }, [selectedId]);

    // Clear response when switching env
    React.useEffect(() => {
        setResponse(null);
        setStatusCode(null);
        setResponseTime(null);
    }, [env]);

    const setField = React.useCallback((name: string, val: string) => {
        setValues((prev) => ({ ...prev, [name]: val }));
        setFieldErrors((prev) => { const next = new Set(prev); next.delete(name); return next; });
    }, []);

    const reset = React.useCallback(() => {
        const defaults: Record<string, string> = {};
        endpoint.fields.forEach((f) => { if (f.defaultValue) defaults[f.name] = f.defaultValue; });
        setValues(defaults);
        setFieldErrors(new Set());
        setResponse(null);
        setStatusCode(null);
        setResponseTime(null);
    }, [endpoint]);

    const execute = React.useCallback(async () => {
        // Live mode requires an API key
        if (env === "live" && !apiKey) {
            setResponse({
                success: false, code: "API_KEY_REQUIRED",
                message: "Une clé API est requise pour le mode Live.",
                data: null, timestamp: new Date().toISOString(),
            });
            setStatusCode(401);
            setResponseTime(null);
            setMobileTab("response");
            return;
        }

        const missing = endpoint.fields.filter((f) => f.required && !values[f.name]);
        if (missing.length > 0) {
            setFieldErrors(new Set(missing.map((f) => f.name)));
            setResponse({
                success: false, code: "VALIDATION_ERROR",
                message: `Champs requis manquants : ${missing.map((f) => f.label).join(", ")}`,
                data: null, timestamp: new Date().toISOString(),
            });
            setStatusCode(400);
            setResponseTime(null);
            setMobileTab("response");
            return;
        }

        setFieldErrors(new Set());
        setLoading(true);
        const start = Date.now();

        if (env === "simulation") {
            await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
            setResponse(endpoint.buildResponse(values));
            setStatusCode(endpoint.statusCode);
            setResponseTime(Date.now() - start);
        } else {
            // Live: real HTTP request
            try {
                const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
                const path = endpoint.path.replace("{reference}", values.reference || "");
                const url  = `${base}${path}`;

                let res: Response;
                if (endpoint.method === "GET") {
                    res = await fetch(url, {
                        headers: { "X-API-KEY": apiKey },
                    });
                } else {
                    const body: Record<string, unknown> = {};
                    endpoint.fields.forEach((f) => {
                        const v = values[f.name] || f.defaultValue || "";
                        if (v) body[f.name] = f.type === "number" ? Number(v) : v;
                    });
                    res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
                        body: JSON.stringify(body),
                    });
                }

                const elapsed = Date.now() - start;
                let data: object;
                try   { data = await res.json(); }
                catch { data = { error: "Réponse non-JSON", status: res.status }; }

                setResponse(data);
                setStatusCode(res.status);
                setResponseTime(elapsed);
            } catch (err) {
                setResponse({
                    success: false, code: "NETWORK_ERROR",
                    message: err instanceof Error ? err.message : "Erreur réseau inconnue",
                    data: null, timestamp: new Date().toISOString(),
                });
                setStatusCode(0);
                setResponseTime(Date.now() - start);
            }
        }

        setLoading(false);
        setMobileTab("response");
    }, [env, endpoint, values, apiKey]);

    const executeRef = React.useRef(execute);
    React.useEffect(() => { executeRef.current = execute; }, [execute]);

    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") executeRef.current();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const toggleShowApiKey = React.useCallback(() => setShowApiKey((v) => !v), []);

    const copyCurl = React.useCallback(() => {
        navigator.clipboard.writeText(buildCurl(endpoint, apiKey, values));
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
    }, [endpoint, apiKey, values]);

    const copyResponse = React.useCallback(() => {
        if (!response) return;
        navigator.clipboard.writeText(JSON.stringify(response, null, 2));
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
    }, [response]);

    const curl = buildCurl(endpoint, apiKey, values);

    // ── Layout ──────────────────────────────────────────────────────────────

    return (
        <div className="-m-6 md:-m-8 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            {/* Page header */}
            <div className="border-b bg-background px-5 py-3 shrink-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">API Lab</h1>
                        <p className="text-xs text-muted-foreground">Testez les endpoints en temps réel</p>
                    </div>
                </div>
                <EnvToggle env={env} onChange={setEnv} />
            </div>

            {/* Main area */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left - endpoint list */}
                <aside className="hidden md:block w-52 shrink-0 border-r bg-background overflow-y-auto">
                    <EndpointList selectedId={selectedId} onSelect={setSelectedId} />
                </aside>

                {/* Center + Right */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    {/* Mobile selector */}
                    <div className="md:hidden border-b px-4 py-2.5 bg-background">
                        <Select value={selectedId} onValueChange={setSelectedId}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <React.Fragment key={cat}>
                                        <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{cat}</div>
                                        {ENDPOINTS.filter((e) => e.category === cat).map((e) => (
                                            <SelectItem key={e.id} value={e.id} className="text-xs">
                                                <span className="flex items-center gap-2">
                                                    <MethodBadge method={e.method} />
                                                    {e.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mobile tab toggle */}
                    <div className="md:hidden flex border-b bg-background shrink-0">
                        {(["request", "response"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setMobileTab(tab)}
                                className={cn(
                                    "flex-1 py-2 text-xs font-semibold capitalize transition-colors border-b-2",
                                    mobileTab === tab
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {tab === "request" ? "Requête" : "Réponse"}
                            </button>
                        ))}
                    </div>

                    {/* Desktop side-by-side panels */}
                    <div className="flex-1 overflow-hidden flex">
                        {/* Request */}
                        <div className={cn(
                            "border-r overflow-y-auto px-6 py-6",
                            "hidden md:block md:w-[460px] lg:w-[520px] shrink-0",
                            mobileTab === "request" && "block w-full",
                        )}>
                            <RequestPanel
                                env={env}
                                endpoint={endpoint}
                                apiKey={apiKey}
                                onApiKeyChange={setApiKey}
                                showApiKey={showApiKey}
                                onToggleShowApiKey={toggleShowApiKey}
                                values={values}
                                fieldErrors={fieldErrors}
                                onFieldChange={setField}
                                onExecute={execute}
                                loading={loading}
                                onReset={reset}
                            />
                        </div>

                        {/* Response + cURL stacked */}
                        <div className={cn(
                            "flex-1 min-w-0 overflow-hidden flex-col",
                            "hidden md:flex",
                            mobileTab === "response" && "flex",
                        )}>
                            <div className="flex-1 overflow-hidden px-6 py-6">
                                <ResponsePanel
                                    env={env}
                                    response={response}
                                    statusCode={statusCode}
                                    responseTime={responseTime}
                                    copied={copiedResponse}
                                    onCopy={copyResponse}
                                />
                            </div>
                            <div className="shrink-0 border-t px-6 py-4">
                                <CurlPanel curl={curl} copied={copiedCurl} onCopy={copyCurl} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
