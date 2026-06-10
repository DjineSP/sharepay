"use client";

import * as React from "react";
import { Copy, Check, Download, ChevronDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";
const SWAGGER_URL = process.env.NEXT_PUBLIC_SWAGGER_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionId =
    | "intro" | "auth" | "response-format" | "errors"
    | "payin-checkout" | "payin-charge" | "payin-status"
    | "payout-transfer" | "payout-status"
    | "webhooks"
    | "sdk-js" | "sdk-php" | "sdk-python";

// Context so Section can read its own state without prop drilling
const CollapseCtx = React.createContext<{
    collapsed: Set<SectionId>;
    toggle: (id: SectionId) => void;
}>({ collapsed: new Set(), toggle: () => {} });

interface NavCategory {
    title: string;
    color: string;
    items: { id: SectionId; label: string }[];
}

const NAV: NavCategory[] = [
    {
        title: "Démarrage",
        color: "text-sky-500 dark:text-sky-400",
        items: [
            { id: "intro", label: "Introduction" },
            { id: "auth", label: "Authentification" },
            { id: "response-format", label: "Format des réponses" },
            { id: "errors", label: "Codes d'erreur" },
        ],
    },
    {
        title: "Pay-In",
        color: "text-emerald-500 dark:text-emerald-400",
        items: [
            { id: "payin-checkout", label: "Checkout" },
            { id: "payin-charge", label: "Charge directe" },
            { id: "payin-status", label: "Statut" },
        ],
    },
    {
        title: "Pay-Out",
        color: "text-violet-500 dark:text-violet-400",
        items: [
            { id: "payout-transfer", label: "Virement" },
            { id: "payout-status", label: "Statut" },
        ],
    },
    {
        title: "Webhooks",
        color: "text-amber-500 dark:text-amber-400",
        items: [{ id: "webhooks", label: "Événements" }],
    },
    {
        title: "SDKs",
        color: "text-pink-500 dark:text-pink-400",
        items: [
            { id: "sdk-js", label: "JavaScript / Node" },
            { id: "sdk-php", label: "PHP" },
            { id: "sdk-python", label: "Python" },
        ],
    },
];

// ── Syntax highlighting ────────────────────────────────────────────────────────

type TokType = "comment" | "string" | "number" | "keyword" | "fn" | "variable" | "tag" | "plain";

const RULES: Record<string, { type: TokType; re: RegExp }[]> = {
    javascript: [
        { type: "comment",  re: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/ },
        { type: "string",   re: /^(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
        { type: "number",   re: /^\b\d+(?:\.\d+)?\b/ },
        { type: "keyword",  re: /^\b(const|let|var|function|async|await|return|require|class|new|if|else|for|while|of|in|true|false|null|undefined|this|export|default|typeof|throw|try|catch|finally)\b/ },
        { type: "fn",       re: /^\b[a-zA-Z_$][\w$]*(?=\s*\()/ },
    ],
    php: [
        { type: "comment",  re: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/ },
        { type: "string",   re: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
        { type: "number",   re: /^\b\d+(?:\.\d+)?\b/ },
        { type: "tag",      re: /^(<\?php|\?>)/ },
        { type: "variable", re: /^\$[a-zA-Z_]\w*/ },
        { type: "keyword",  re: /^\b(class|function|public|private|protected|static|new|return|if|else|foreach|echo|use|extends|implements|true|false|null|void|array|string|int|bool)\b/ },
        { type: "fn",       re: /^\b[a-zA-Z_]\w*(?=\s*\()/ },
    ],
    python: [
        { type: "comment",  re: /^#[^\n]*/ },
        { type: "string",   re: /^(f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*'|"""[\s\S]*?"""|'''[\s\S]*?''')/ },
        { type: "number",   re: /^\b\d+(?:\.\d+)?\b/ },
        { type: "keyword",  re: /^\b(def|class|import|from|return|if|else|elif|for|while|with|as|True|False|None|and|or|not|in|is|lambda|yield|async|await|raise|try|except|finally|pass)\b/ },
        { type: "fn",       re: /^\b[a-zA-Z_]\w*(?=\s*\()/ },
    ],
};

const TOK_CLS: Record<TokType, string> = {
    comment:  "text-zinc-500 italic",
    string:   "text-emerald-400",
    number:   "text-violet-400",
    keyword:  "text-sky-400",
    fn:       "text-amber-300",
    variable: "text-orange-400",
    tag:      "text-pink-400",
    plain:    "text-zinc-300",
};

function tokenize(code: string, lang: string): { type: TokType; value: string }[] {
    const rules = RULES[lang];
    if (!rules) return [{ type: "plain", value: code }];
    const tokens: { type: TokType; value: string }[] = [];
    let pos = 0;
    while (pos < code.length) {
        let matched = false;
        for (const { type, re } of rules) {
            const m = code.slice(pos).match(re);
            if (m && m.index === 0) {
                tokens.push({ type, value: m[0] });
                pos += m[0].length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            const last = tokens[tokens.length - 1];
            if (last?.type === "plain") last.value += code[pos];
            else tokens.push({ type: "plain", value: code[pos] });
            pos++;
        }
    }
    return tokens;
}

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
    const tokens = React.useMemo(() => tokenize(code, lang), [code, lang]);
    return (
        <>
            {tokens.map((tok, i) => (
                <span key={i} className={TOK_CLS[tok.type]}>{tok.value}</span>
            ))}
        </>
    );
}

// ── CodeBlock ─────────────────────────────────────────────────────────────────

const HIGHLIGHTED_LANGS = new Set(["javascript", "php", "python"]);

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
    const [copied, setCopied] = React.useState(false);

    return (
        <div className="rounded-xl overflow-hidden border border-border/50">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang}</span>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                    {copied
                        ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                        : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copié !" : "Copier"}</span>
                </button>
            </div>
            <pre className="bg-zinc-950 px-4 py-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">
                <code>
                    {HIGHLIGHTED_LANGS.has(lang)
                        ? <HighlightedCode code={code} lang={lang} />
                        : <span className="text-zinc-300">{code}</span>
                    }
                </code>
            </pre>
        </div>
    );
}

// ── MethodBadge ───────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: "GET" | "POST" | "PATCH" | "DELETE" }) {
    const cls: Record<string, string> = {
        GET:    "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 ring-1 ring-emerald-500/30",
        POST:   "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30",
        PATCH:  "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30",
        DELETE: "bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/30",
    };
    return (
        <span className={cn("inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide", cls[method])}>
            {method}
        </span>
    );
}

// ── FieldTable ────────────────────────────────────────────────────────────────

interface Field {
    name: string;
    type: string;
    required?: boolean;
    description: string;
    example?: string;
}

function FieldTable({ fields, title }: { fields: Field[]; title: string }) {
    return (
        <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
            <div className="border rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Champ</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Type</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell">Requis</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden lg:table-cell">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {fields.map((f) => (
                            <tr key={f.name} className="hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2.5 font-mono font-semibold text-foreground whitespace-nowrap">{f.name}</td>
                                <td className="px-3 py-2.5 font-mono text-purple-500 dark:text-purple-400 whitespace-nowrap">{f.type}</td>
                                <td className="px-3 py-2.5 hidden sm:table-cell">
                                    {f.required
                                        ? <span className="text-red-500 font-semibold">oui</span>
                                        : <span className="text-muted-foreground">non</span>}
                                </td>
                                <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell">
                                    {f.description}
                                    {f.example && (
                                        <span className="ml-1.5 font-mono text-zinc-500">ex: {f.example}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: SectionId; title: string; children: React.ReactNode }) {
    const { collapsed, toggle } = React.useContext(CollapseCtx);
    const isOpen = !collapsed.has(id);
    return (
        <section id={id} className="scroll-mt-6 pb-6 border-b border-border/50 last:border-0">
            <button
                onClick={() => toggle(id)}
                className="flex items-center justify-between w-full py-3 group text-left"
            >
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0",
                        !isOpen && "-rotate-90",
                    )}
                />
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
                )}
            >
                <div className="space-y-5 pb-6">
                    {children}
                </div>
            </div>
        </section>
    );
}

function EndpointHeader({ method, path, description }: {
    method: "GET" | "POST";
    path: string;
    description: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
                <MethodBadge method={method} />
                <code className="font-mono text-sm font-semibold bg-muted/60 px-3 py-1 rounded-lg border border-border/60">
                    {path}
                </code>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

// ── BaseUrlCard ───────────────────────────────────────────────────────────────

function BaseUrlCard() {
    const [copied, setCopied] = React.useState(false);
    return (
        <div className="bg-muted/40 rounded-xl p-4 border group">
            <div className="text-lg mb-1">🌐</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">URL de base</div>
            <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-mono font-semibold text-foreground break-all flex-1">{BASE_URL}</span>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(BASE_URL);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Copier l'URL"
                >
                    {copied
                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                        : <Copy className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
}

// ── Print styles ──────────────────────────────────────────────────────────────

const PRINT_STYLES = `
@media print {
    aside, .print\\:hidden { display: none !important; }
    main { overflow: visible !important; }
    pre { white-space: pre-wrap; word-break: break-all; }
    section { page-break-inside: avoid; }
    h2 { page-break-before: always; }
    h2:first-of-type { page-break-before: avoid; }
}
`;

// ── Main Component ────────────────────────────────────────────────────────────

export function MerchantDocsPage() {
    const [active, setActive] = React.useState<SectionId>("intro");
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [collapsed, setCollapsed] = React.useState<Set<SectionId>>(new Set());
    const flat = NAV.flatMap((c) => c.items);

    const toggle = React.useCallback((id: SectionId) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const [collapsedCats, setCollapsedCats] = React.useState<Set<string>>(new Set());
    const toggleCat = (title: string) => {
        setCollapsedCats((prev) => {
            const next = new Set(prev);
            if (next.has(title)) next.delete(title); else next.add(title);
            return next;
        });
    };

    React.useEffect(() => {
        const sections = document.querySelectorAll("section[id]");
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length > 0) setActive(visible[0].target.id as SectionId);
            },
            { rootMargin: "-10% 0px -80% 0px", threshold: 0 },
        );
        sections.forEach((s) => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    const scrollTo = (id: SectionId) => {
        // Auto-expand if collapsed before scrolling
        setCollapsed((prev) => { const next = new Set(prev); next.delete(id); return next; });
        setActive(id);
        setMobileOpen(false);
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
    };

    const Sidebar = () => (
        <nav className="px-5 py-7 space-y-5">
            {NAV.map((cat) => {
                const isCatOpen = !collapsedCats.has(cat.title);
                return (
                    <div key={cat.title}>
                        <button
                            onClick={() => toggleCat(cat.title)}
                            className="flex items-center justify-between w-full px-2 mb-1 group"
                        >
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", cat.color)}>
                                {cat.title}
                            </span>
                            <ChevronDown
                                className={cn(
                                    "h-3 w-3 transition-transform duration-200",
                                    cat.color,
                                    !isCatOpen && "-rotate-90",
                                )}
                            />
                        </button>
                        <div className={cn(
                            "overflow-hidden transition-all duration-200",
                            isCatOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
                        )}>
                            <ul className="space-y-0.5">
                                {cat.items.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => scrollTo(item.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                                active === item.id
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            })}
        </nav>
    );

    return (
        <CollapseCtx.Provider value={{ collapsed, toggle }}>
        <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
        <div className="-m-6 md:-m-8 flex h-[calc(100vh-4rem)] overflow-hidden print:h-auto print:block">
            {/* Left sidebar - desktop */}
            <aside className="hidden md:block w-52 shrink-0 border-r bg-background overflow-y-auto">
                <Sidebar />
            </aside>

            {/* Mobile overlay sidebar */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30 bg-black/50 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="fixed left-0 top-16 bottom-0 z-40 w-64 bg-background border-r overflow-y-auto md:hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <span className="text-sm font-semibold">Documentation</span>
                            <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">✕</button>
                        </div>
                        <Sidebar />
                    </aside>
                </>
            )}

            {/* Main content */}
            <main className="flex-1 min-w-0 overflow-y-auto print:overflow-visible">
                {/* Top bar - mobile nav + PDF button */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-2 print:hidden">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden text-sm text-muted-foreground hover:text-foreground font-medium"
                    >
                        ☰
                    </button>
                    <span className="md:hidden text-muted-foreground">/</span>
                    <span className="md:hidden text-sm font-medium text-foreground truncate">
                        {flat.find((i) => i.id === active)?.label}
                    </span>
                    <div className="flex-1" />
                    {SWAGGER_URL && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs h-8"
                            onClick={() => window.open(SWAGGER_URL, "_blank", "noopener,noreferrer")}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Swagger UI</span>
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={() => window.print()}
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Télécharger PDF</span>
                        <span className="sm:hidden">PDF</span>
                    </Button>
                </div>

                <div className="px-8 md:px-12 py-10 space-y-2">

                    {/* Introduction */}
                    <Section id="intro" title="Introduction">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            L'API Aggregator SharePay vous permet d'intégrer des paiements entrants (<strong>Pay-In</strong>) et
                            sortants (<strong>Pay-Out</strong>) directement dans vos applications. Elle est basée sur REST,
                            utilise JSON et retourne toujours une enveloppe{" "}
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">ApiResponse&lt;T&gt;</code> standard.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3 mt-2">
                            <BaseUrlCard />
                            {[
                                { icon: "🔐", label: "Auth", value: "X-API-KEY header" },
                                { icon: "📦", label: "Format", value: "application/json" },
                            ].map((item) => (
                                <div key={item.label} className="bg-muted/40 rounded-xl p-4 border">
                                    <div className="text-lg mb-1">{item.icon}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</div>
                                    <div className="text-xs font-mono font-semibold text-foreground break-all">{item.value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                { emoji: "✅", title: "Pay-In - Checkout", desc: "Générez un lien de paiement et redirigez le client vers la page de paiement hébergée." },
                                { emoji: "⚡", title: "Pay-In - Charge", desc: "Initiez un débit direct sur le compte mobile du client sans page web intermédiaire." },
                                { emoji: "💸", title: "Pay-Out - Transfer", desc: "Envoyez des fonds vers un bénéficiaire via Mobile Money." },
                                { emoji: "🔔", title: "Webhooks", desc: "Recevez des notifications en temps réel sur l'état de chaque transaction." },
                            ].map((item) => (
                                <div key={item.title} className="rounded-xl border p-4 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span>{item.emoji}</span>
                                        <span className="text-sm font-semibold">{item.title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Authentication */}
                    <Section id="auth" title="Authentification">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Toutes les requêtes doivent inclure votre clé API dans l'en-tête{" "}
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">X-API-KEY</code>.
                            Vos clés sont disponibles dans la section <strong>Applications</strong> du dashboard.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { prefix: "sk_live_", env: "Production", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
                                { prefix: "sk_test_", env: "Test", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
                            ].map((e) => (
                                <div key={e.prefix} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 border text-xs", e.cls)}>
                                    <code className="font-mono font-bold">{e.prefix}••••••••</code>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{e.env}</Badge>
                                </div>
                            ))}
                        </div>
                        <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-in/checkout \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_votre_cle_ici" \\
  -d '{ "amount": 5000, "currency": "XAF" }'`} />
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">⚠ Sécurité</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                N'incluez jamais votre clé API dans du code côté client (navigateur).
                                Effectuez tous les appels depuis votre serveur backend.
                                En cas de compromission, régénérez la clé immédiatement depuis votre dashboard.
                            </p>
                        </div>
                    </Section>

                    {/* Response Format */}
                    <Section id="response-format" title="Format des réponses">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Toutes les réponses, succès comme erreur, utilisent l'enveloppe{" "}
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">ApiResponse&lt;T&gt;</code> :
                        </p>
                        <FieldTable title="Champs" fields={[
                            { name: "success", type: "boolean", description: "true si la requête s'est exécutée sans erreur" },
                            { name: "code", type: "string", description: "Code métier lisible par la machine", example: "CHECKOUT_CREATED" },
                            { name: "message", type: "string", description: "Message lisible par l'humain" },
                            { name: "data", type: "T | null", description: "Données de la réponse (null si erreur)" },
                            { name: "timestamp", type: "ISO 8601", description: "Horodatage de la réponse" },
                        ]} />
                        <CodeBlock lang="json" code={`// Succès
{
  "success": true,
  "code": "CHECKOUT_CREATED",
  "message": "Session de paiement créée.",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "PENDING",
    "amount": 5000,
    "currency": "XAF",
    "paymentUrl": "https://checkout.sharepay.cm/pay/cs_..."
  },
  "timestamp": "2026-05-03T12:00:00.000Z"
}

// Erreur
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Le champ 'amount' est requis.",
  "data": null,
  "timestamp": "2026-05-03T12:00:01.000Z"
}`} />
                    </Section>

                    {/* Errors */}
                    <Section id="errors" title="Codes d'erreur">
                        <p className="text-sm text-muted-foreground">
                            Quand <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">success</code> est{" "}
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">false</code>,{" "}
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">data</code> est null
                            et le champ <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">code</code> identifie l'erreur.
                        </p>
                        <div className="border rounded-xl overflow-hidden text-xs">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground">HTTP</th>
                                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Code</th>
                                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden md:table-cell">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {[
                                        { http: "400", code: "VALIDATION_ERROR", desc: "Corps de la requête invalide ou champs manquants" },
                                        { http: "401", code: "UNAUTHORIZED", desc: "Clé API absente, invalide ou révoquée" },
                                        { http: "404", code: "NOT_FOUND", desc: "Ressource introuvable (référence inexistante)" },
                                        { http: "409", code: "DUPLICATE_REQUEST", desc: "Même idempotencyKey déjà traitée - doublon évité" },
                                        { http: "422", code: "INSUFFICIENT_BALANCE", desc: "Solde insuffisant pour effectuer ce virement" },
                                        { http: "429", code: "RATE_LIMIT_EXCEEDED", desc: "Limite de requêtes atteinte - attendez avant de réessayer" },
                                        { http: "500", code: "INTERNAL_ERROR", desc: "Erreur interne serveur" },
                                    ].map((e) => (
                                        <tr key={e.code} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-bold text-red-500">{e.http}</td>
                                            <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">{e.code}</td>
                                            <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{e.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* Pay-In: Checkout */}
                    <Section id="payin-checkout" title="Pay-In - Checkout">
                        <EndpointHeader
                            method="POST"
                            path="/api/v1/pay-in/checkout"
                            description="Crée une session de paiement web valable 30 minutes. Redirigez votre client vers le paymentUrl retourné pour qu'il choisisse son opérateur et finalise le paiement."
                        />
                        <FieldTable title="Corps de la requête" fields={[
                            { name: "amount", type: "integer", required: true, description: "Montant en unité de base de la devise", example: "5000" },
                            { name: "currency", type: "string", required: true, description: "Devise ISO 4217", example: "XAF" },
                            { name: "merchantReference", type: "string", description: "Votre référence interne (libre)", example: "CMD-2024-001" },
                            { name: "description", type: "string", description: "Description affichée sur la page de paiement" },
                            { name: "successUrl", type: "string (URL)", description: "URL de redirection après succès" },
                            { name: "cancelUrl", type: "string (URL)", description: "URL de redirection après annulation" },
                        ]} />
                        <FieldTable title="Réponse (data)" fields={[
                            { name: "reference", type: "string", description: "Référence unique de la transaction", example: "PI-A1B2C3D4E5F6" },
                            { name: "status", type: '"PENDING"', description: "Statut initial de la session" },
                            { name: "amount", type: "integer", description: "Montant confirmé" },
                            { name: "currency", type: "string", description: "Devise" },
                            { name: "description", type: "string?", description: "Description (si fournie)" },
                            { name: "paymentUrl", type: "string (URL)", description: "URL vers laquelle rediriger le client" },
                        ]} />
                        <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-in/checkout \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_votre_cle" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "merchantReference": "CMD-2024-001",
    "description": "Paiement commande #001",
    "successUrl": "https://mon-site.cm/success",
    "cancelUrl": "https://mon-site.cm/cancel"
  }'`} />
                        <CodeBlock lang="json" code={`{
  "success": true,
  "code": "CHECKOUT_CREATED",
  "message": "Session de paiement créée.",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "PENDING",
    "amount": 5000,
    "currency": "XAF",
    "description": "Paiement commande #001",
    "paymentUrl": "https://checkout.sharepay.cm/pay/cs_a1b2c3d4e5f6"
  },
  "timestamp": "2026-05-03T12:00:00.000Z"
}`} />
                    </Section>

                    {/* Pay-In: Charge */}
                    <Section id="payin-charge" title="Pay-In - Charge directe">
                        <EndpointHeader
                            method="POST"
                            path="/api/v1/pay-in/charge"
                            description="Initie un paiement direct sans page web intermédiaire. Le provider et le compte payeur doivent être fournis dans la requête. Utilisez idempotencyKey pour éviter les doublons en cas de retry."
                        />
                        <FieldTable title="Corps de la requête" fields={[
                            { name: "amount", type: "integer", required: true, description: "Montant en unité de base", example: "5000" },
                            { name: "currency", type: "string", required: true, description: "Devise ISO 4217", example: "XAF" },
                            { name: "paymentMethod", type: "string", required: true, description: "Code du provider Mobile Money", example: "MTN_MOMO_CM" },
                            { name: "payerAccount", type: "string", required: true, description: "Numéro de téléphone du payeur", example: "237690000000" },
                            { name: "merchantReference", type: "string", description: "Référence interne du marchand" },
                            { name: "description", type: "string", description: "Description de la transaction" },
                            { name: "payerName", type: "string", description: "Nom du payeur" },
                            { name: "payerEmail", type: "string", description: "Email du payeur" },
                            { name: "idempotencyKey", type: "string", description: "Clé d'idempotence (évite les doublons)", example: "idem-001-v1" },
                        ]} />
                        <div className="bg-muted/40 rounded-xl px-4 py-3 border text-xs">
                            <p className="font-semibold mb-2">Valeurs de <code className="font-mono">paymentMethod</code></p>
                            <div className="flex gap-2 flex-wrap">
                                <code className="bg-background px-2.5 py-1 rounded border font-mono">MTN_MOMO_CM</code>
                                <code className="bg-background px-2.5 py-1 rounded border font-mono">ORANGE_MONEY_CM</code>
                            </div>
                        </div>
                        <FieldTable title="Réponse (data)" fields={[
                            { name: "reference", type: "string", description: "Référence unique", example: "PI-A1B2C3D4E5F6" },
                            { name: "status", type: '"PROCESSING"', description: "Statut initial - traitement en cours" },
                            { name: "amount", type: "integer", description: "Montant" },
                            { name: "currency", type: "string", description: "Devise" },
                            { name: "paymentMethod", type: "string", description: "Provider utilisé" },
                            { name: "payerAccount", type: "string", description: "Compte payeur" },
                            { name: "payerName", type: "string?", description: "Nom du payeur (si fourni)" },
                            { name: "payerEmail", type: "string?", description: "Email du payeur (si fourni)" },
                        ]} />
                        <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-in/charge \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_votre_cle" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000",
    "payerName": "Jean Dupont",
    "idempotencyKey": "idem-cmd-001-v1"
  }'`} />
                        <CodeBlock lang="json" code={`{
  "success": true,
  "code": "PAYMENT_INITIATED",
  "message": "Paiement initié.",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "PROCESSING",
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000",
    "payerName": "Jean Dupont"
  },
  "timestamp": "2026-05-03T12:00:00.000Z"
}`} />
                    </Section>

                    {/* Pay-In: Status */}
                    <Section id="payin-status" title="Pay-In - Vérifier le statut">
                        <EndpointHeader
                            method="GET"
                            path="/api/v1/pay-in/check_status/{reference}"
                            description="Retourne le statut courant d'une transaction entrante (CHECKOUT ou CHARGE) identifiée par sa référence. Recommandé pour le polling en attendant la notification webhook."
                        />
                        <FieldTable title="Paramètre de chemin" fields={[
                            { name: "reference", type: "string", required: true, description: "Référence de la transaction", example: "PI-A1B2C3D4E5F6" },
                        ]} />
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statuts possibles</h4>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                {[
                                    { s: "PENDING", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
                                    { s: "PROCESSING", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                                    { s: "SUCCESS", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
                                    { s: "FAILED", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                                    { s: "CANCELLED", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
                                    { s: "REFUNDED", cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
                                ].map(({ s, cls }) => (
                                    <span key={s} className={cn("px-2.5 py-1 rounded-lg", cls)}>{s}</span>
                                ))}
                            </div>
                        </div>
                        <CodeBlock lang="bash" code={`curl -X GET ${BASE_URL}/pay-in/check_status/PI-A1B2C3D4E5F6 \\
  -H "X-API-KEY: sk_live_votre_cle"`} />
                        <CodeBlock lang="json" code={`{
  "success": true,
  "code": "OK",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "type": "CHARGE",
    "status": "SUCCESS",
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000",
    "payerName": "Jean Dupont"
  },
  "timestamp": "2026-05-03T12:05:00.000Z"
}`} />
                    </Section>

                    {/* Pay-Out: Transfer */}
                    <Section id="payout-transfer" title="Pay-Out - Virement">
                        <EndpointHeader
                            method="POST"
                            path="/api/v1/pay-out/transfer"
                            description="Crée un virement vers un bénéficiaire. Le montant est débité de votre solde disponible. La transaction passe immédiatement en PROCESSING - le résultat définitif est notifié par webhook."
                        />
                        <FieldTable title="Corps de la requête" fields={[
                            { name: "amount", type: "integer", required: true, description: "Montant à envoyer", example: "10000" },
                            { name: "currency", type: "string", required: true, description: "Devise ISO 4217", example: "XAF" },
                            { name: "paymentMethod", type: "string", required: true, description: "Provider Mobile Money", example: "MTN_MOMO_CM" },
                            { name: "beneficiaryAccount", type: "string", required: true, description: "Téléphone du bénéficiaire", example: "237690000000" },
                            { name: "beneficiaryName", type: "string", required: true, description: "Nom complet du bénéficiaire", example: "Marie Martin" },
                            { name: "merchantReference", type: "string", description: "Votre référence interne" },
                            { name: "description", type: "string", description: "Description du virement" },
                            { name: "beneficiaryEmail", type: "string", description: "Email du bénéficiaire" },
                        ]} />
                        <FieldTable title="Réponse (data)" fields={[
                            { name: "reference", type: "string", description: "Référence unique du payout", example: "PO-A1B2C3D4E5F6" },
                            { name: "status", type: '"PROCESSING"', description: "Statut initial" },
                            { name: "amount", type: "integer", description: "Montant" },
                            { name: "currency", type: "string", description: "Devise" },
                            { name: "paymentMethod", type: "string", description: "Provider utilisé" },
                            { name: "beneficiaryAccount", type: "string", description: "Compte bénéficiaire" },
                            { name: "beneficiaryName", type: "string", description: "Nom du bénéficiaire" },
                        ]} />
                        <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-out/transfer \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_votre_cle" \\
  -d '{
    "amount": 10000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "beneficiaryAccount": "237690000000",
    "beneficiaryName": "Marie Martin",
    "description": "Remboursement client #001"
  }'`} />
                        <CodeBlock lang="json" code={`{
  "success": true,
  "code": "PAYOUT_INITIATED",
  "message": "Virement initié.",
  "data": {
    "reference": "PO-A1B2C3D4E5F6",
    "status": "PROCESSING",
    "amount": 10000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "beneficiaryAccount": "237690000000",
    "beneficiaryName": "Marie Martin"
  },
  "timestamp": "2026-05-03T12:00:00.000Z"
}`} />
                    </Section>

                    {/* Pay-Out: Status */}
                    <Section id="payout-status" title="Pay-Out - Vérifier le statut">
                        <EndpointHeader
                            method="GET"
                            path="/api/v1/pay-out/check_status/{reference}"
                            description="Retourne le statut courant d'une transaction sortante identifiée par sa référence."
                        />
                        <FieldTable title="Paramètre de chemin" fields={[
                            { name: "reference", type: "string", required: true, description: "Référence du payout", example: "PO-A1B2C3D4E5F6" },
                        ]} />
                        <CodeBlock lang="bash" code={`curl -X GET ${BASE_URL}/pay-out/check_status/PO-A1B2C3D4E5F6 \\
  -H "X-API-KEY: sk_live_votre_cle"`} />
                        <CodeBlock lang="json" code={`{
  "success": true,
  "code": "OK",
  "data": {
    "reference": "PO-A1B2C3D4E5F6",
    "status": "SUCCESS",
    "amount": 10000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "beneficiaryAccount": "237690000000",
    "beneficiaryName": "Marie Martin"
  },
  "timestamp": "2026-05-03T12:08:00.000Z"
}`} />
                    </Section>

                    {/* Webhooks */}
                    <Section id="webhooks" title="Webhooks">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            SharePay envoie des notifications HTTP POST vers votre URL webhook lorsque des événements surviennent.
                            Chaque payload est signé avec HMAC-SHA256 via l'en-tête{" "}
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">X-Sharepay-Signature</code>.
                            Configurez votre URL dans <strong>Applications → Webhooks</strong>.
                        </p>

                        <div className="border rounded-xl overflow-hidden text-xs">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Événement</th>
                                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {[
                                        { event: "payment.success", desc: "Un paiement entrant a été confirmé par le provider" },
                                        { event: "payment.failed", desc: "Un paiement entrant a échoué ou a été rejeté" },
                                        { event: "payment.cancelled", desc: "Le client a annulé la session de paiement" },
                                        { event: "payout.success", desc: "Un virement vers un bénéficiaire a réussi" },
                                        { event: "payout.failed", desc: "Un virement a échoué" },
                                        { event: "webhook.test", desc: "Événement de test envoyé depuis le dashboard" },
                                    ].map((e) => (
                                        <tr key={e.event} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-semibold text-foreground">{e.event}</td>
                                            <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{e.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <CodeBlock lang="json" code={`// Payload envoyé vers votre URL webhook
{
  "event": "payment.success",
  "timestamp": "2026-05-03T12:05:00.000Z",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "SUCCESS",
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000",
    "payerName": "Jean Dupont"
  }
}`} />

                        <CodeBlock lang="javascript" code={`// Vérification de la signature (Node.js / Express)
const crypto = require('crypto');

function verifySignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(digest, 'hex')
  );
}

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-sharepay-signature'];

  if (!verifySignature(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Signature invalide');
  }

  const { event, data } = JSON.parse(req.body);

  switch (event) {
    case 'payment.success':
      // Confirmer la commande, envoyer un reçu...
      break;
    case 'payout.success':
      // Mettre à jour le statut du virement...
      break;
  }

  res.status(200).send('OK');
});`} />
                    </Section>

                    {/* ── SDK - JavaScript ──────────────────────────── */}
                    <Section id="sdk-js" title="SDK - JavaScript / Node.js">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Exemple d'intégration avec <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">axios</code> pour Node.js / navigateur.
                            Installez-le avec <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">npm install axios</code>.
                        </p>
                        <CodeBlock lang="javascript" code={`// sharepay.js - client minimal
const axios = require('axios');

const client = axios.create({
  baseURL: '${BASE_URL}',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.SHAREPAY_API_KEY,
  },
});

// ── Pay-In : Checkout ─────────────────────────────────────────
async function createCheckout({ amount, currency, description, successUrl, cancelUrl, merchantReference }) {
  const { data } = await client.post('/pay-in/checkout', {
    amount, currency, description, successUrl, cancelUrl, merchantReference,
  });
  return data.data; // { reference, status, paymentUrl }
}

// ── Pay-In : Charge directe ───────────────────────────────────
async function createCharge({ amount, currency, paymentMethod, payerAccount, payerName, idempotencyKey }) {
  const { data } = await client.post('/pay-in/charge', {
    amount, currency, paymentMethod, payerAccount, payerName, idempotencyKey,
  });
  return data.data; // { reference, status }
}

// ── Statut d'un pay-in ────────────────────────────────────────
async function getPayInStatus(reference) {
  const { data } = await client.get(\`/pay-in/check_status/\${reference}\`);
  return data.data; // { reference, status, amount, ... }
}

// ── Pay-Out : Virement ────────────────────────────────────────
async function createTransfer({ amount, currency, paymentMethod, beneficiaryAccount, beneficiaryName }) {
  const { data } = await client.post('/pay-out/transfer', {
    amount, currency, paymentMethod, beneficiaryAccount, beneficiaryName,
  });
  return data.data; // { reference, status }
}

// ── Exemple d'utilisation ─────────────────────────────────────
(async () => {
  const session = await createCheckout({
    amount: 5000,
    currency: 'XAF',
    description: 'Paiement commande #001',
    successUrl: 'https://mon-site.cm/success',
    cancelUrl:  'https://mon-site.cm/cancel',
  });
  console.log('Lien de paiement :', session.paymentUrl);
})();`} />
                    </Section>

                    {/* ── SDK - PHP ─────────────────────────────────────── */}
                    <Section id="sdk-php" title="SDK - PHP">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Exemple d'intégration en PHP natif avec <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">cURL</code>.
                            Compatible PHP 7.4+.
                        </p>
                        <CodeBlock lang="php" code={`<?php
// SharePayClient.php

class SharePayClient
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct(string $apiKey, string $baseUrl = '${BASE_URL}')
    {
        $this->apiKey  = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    private function request(string $method, string $path, array $body = []): array
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $this->baseUrl . $path,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => strtoupper($method),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-API-KEY: ' . $this->apiKey,
            ],
        ]);
        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }

    // Pay-In : Checkout
    public function createCheckout(array $params): array
    {
        $res = $this->request('POST', '/pay-in/checkout', $params);
        return $res['data']; // ['reference', 'status', 'paymentUrl']
    }

    // Pay-In : Charge directe
    public function createCharge(array $params): array
    {
        $res = $this->request('POST', '/pay-in/charge', $params);
        return $res['data'];
    }

    // Statut d'un pay-in
    public function getPayInStatus(string $reference): array
    {
        $res = $this->request('GET', '/pay-in/check_status/' . $reference);
        return $res['data'];
    }

    // Pay-Out : Virement
    public function createTransfer(array $params): array
    {
        $res = $this->request('POST', '/pay-out/transfer', $params);
        return $res['data'];
    }
}

// ── Utilisation ───────────────────────────────────────────────
$client = new SharePayClient($_ENV['SHAREPAY_API_KEY']);

$session = $client->createCheckout([
    'amount'      => 5000,
    'currency'    => 'XAF',
    'description' => 'Paiement commande #001',
    'successUrl'  => 'https://mon-site.cm/success',
    'cancelUrl'   => 'https://mon-site.cm/cancel',
]);

header('Location: ' . $session['paymentUrl']);
exit;`} />
                    </Section>

                    {/* ── SDK - Python ──────────────────────────────────── */}
                    <Section id="sdk-python" title="SDK - Python">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Exemple d'intégration avec <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">requests</code>.
                            Installez-le avec <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">pip install requests</code>.
                        </p>
                        <CodeBlock lang="python" code={`# sharepay.py - client minimal
import os
import requests

BASE_URL = os.getenv("SHAREPAY_BASE_URL", "${BASE_URL}")
API_KEY  = os.getenv("SHAREPAY_API_KEY", "")

session = requests.Session()
session.headers.update({
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY,
})

# ── Pay-In : Checkout ─────────────────────────────────────────
def create_checkout(amount, currency, description=None, success_url=None, cancel_url=None, merchant_ref=None):
    res = session.post(f"{BASE_URL}/pay-in/checkout", json={
        "amount": amount,
        "currency": currency,
        "description": description,
        "successUrl": success_url,
        "cancelUrl": cancel_url,
        "merchantReference": merchant_ref,
    })
    res.raise_for_status()
    return res.json()["data"]  # {"reference", "status", "paymentUrl"}

# ── Pay-In : Charge directe ───────────────────────────────────
def create_charge(amount, currency, payment_method, payer_account, payer_name=None, idempotency_key=None):
    res = session.post(f"{BASE_URL}/pay-in/charge", json={
        "amount": amount,
        "currency": currency,
        "paymentMethod": payment_method,
        "payerAccount": payer_account,
        "payerName": payer_name,
        "idempotencyKey": idempotency_key,
    })
    res.raise_for_status()
    return res.json()["data"]

# ── Statut d'un pay-in ────────────────────────────────────────
def get_payin_status(reference):
    res = session.get(f"{BASE_URL}/pay-in/check_status/{reference}")
    res.raise_for_status()
    return res.json()["data"]

# ── Pay-Out : Virement ────────────────────────────────────────
def create_transfer(amount, currency, payment_method, beneficiary_account, beneficiary_name):
    res = session.post(f"{BASE_URL}/pay-out/transfer", json={
        "amount": amount,
        "currency": currency,
        "paymentMethod": payment_method,
        "beneficiaryAccount": beneficiary_account,
        "beneficiaryName": beneficiary_name,
    })
    res.raise_for_status()
    return res.json()["data"]

# ── Exemple ───────────────────────────────────────────────────
if __name__ == "__main__":
    data = create_checkout(
        amount=5000,
        currency="XAF",
        description="Paiement commande #001",
        success_url="https://mon-site.cm/success",
        cancel_url="https://mon-site.cm/cancel",
    )
    print("Lien de paiement :", data["paymentUrl"])`} />
                    </Section>

                </div>
            </main>
        </div>
        </CollapseCtx.Provider>
    );
}
