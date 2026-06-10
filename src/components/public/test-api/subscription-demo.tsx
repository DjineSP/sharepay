"use client";

import { useState, useCallback } from "react";
import {
    Check, ChevronLeft, Lock, Smartphone, ArrowRight,
    RefreshCw, Webhook, X, PenLine, ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Provider = "MTN_MOMO_CM" | "ORANGE_MONEY_CM";
type DemoStep = "amounts" | "payment" | "processing" | "success";

// ── Helpers ───────────────────────────────────────────────────────────────────

const genRef = () => `PI-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
const fmt    = (n: number) => n.toLocaleString("fr-FR");

const AMOUNT_CONFIG = [
    { amount: 10, gradient: "from-sky-400 to-blue-500",      shadow: "hover:shadow-blue-500/15",   text: "text-blue-600 dark:text-blue-400"    },
    { amount: 25, gradient: "from-emerald-400 to-primary",   shadow: "hover:shadow-primary/15",    text: "text-primary"                        },
    { amount: 50, gradient: "from-violet-500 to-purple-600", shadow: "hover:shadow-violet-500/15", text: "text-violet-600 dark:text-violet-400" },
];

// ── AmountCard ────────────────────────────────────────────────────────────────

function AmountCard({ amount, gradient, shadow, onTest }: {
    amount: number; gradient: string; shadow: string; onTest: () => void;
}) {
    return (
        <div className={cn(
            "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
            "shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300",
            shadow,
        )}>
            {/* Colored top stripe */}
            <div className={cn("h-1 bg-gradient-to-r shrink-0", gradient)} />

            {/* Ghost watermark number */}
            <div className="pointer-events-none select-none absolute -bottom-3 -right-2 text-[7rem] font-black leading-none text-foreground/[0.04] group-hover:text-foreground/[0.07] transition-colors duration-300">
                {amount}
            </div>

            <div className="relative flex flex-col flex-1 gap-6 px-6 py-8">
                <div className="space-y-1">
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black tracking-tight tabular-nums">{fmt(amount)}</span>
                        <span className="text-base font-semibold text-muted-foreground mb-1.5">XAF</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Paiement unique</p>
                </div>

                <Button onClick={onTest} className="w-full gap-2 rounded-xl font-bold shadow-sm h-11">
                    Tester
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function CustomAmountCard({ onTest }: { onTest: (amount: number) => void }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState(false);

    const handleTest = () => {
        const n = Number(value);
        if (!value || isNaN(n) || n < 10) { setError(true); return; }
        onTest(n);
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:shadow-amber-500/15 transition-all duration-300">
            {/* Amber top stripe */}
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 shrink-0" />

            <div className="relative flex flex-col flex-1 gap-5 px-6 py-8">
                {/* Label */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <PenLine className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Personnalisé</span>
                </div>

                {/* Input area */}
                <div className="space-y-1">
                    <div className="relative flex items-end gap-2 border-b-2 border-border pb-2 focus-within:border-amber-500 transition-colors">
                        <input
                            type="number"
                            min={10}
                            value={value}
                            onChange={(e) => { setValue(e.target.value); setError(false); }}
                            placeholder="0"
                            className={cn(
                                "flex-1 text-4xl font-black tracking-tight tabular-nums bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 w-0",
                                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                error && "text-red-500",
                            )}
                        />
                        <span className="text-sm font-semibold text-muted-foreground mb-1 shrink-0">XAF</span>
                    </div>
                    {error
                        ? <p className="text-xs text-red-500">Minimum 10 XAF</p>
                        : <p className="text-xs text-muted-foreground">Montant libre</p>
                    }
                </div>

                <Button onClick={handleTest} variant="outline" className="w-full gap-2 rounded-xl font-bold border-amber-400/50 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors mt-auto">
                    Tester
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ── ProviderButton ────────────────────────────────────────────────────────────

function ProviderButton({ provider, selected, onClick }: { provider: Provider; selected: boolean; onClick: () => void }) {
    const isMtn = provider === "MTN_MOMO_CM";
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                    ? isMtn
                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400"
                        : "border-orange-400 bg-orange-50 dark:bg-orange-400/10 text-orange-700 dark:text-orange-400"
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground",
            )}
        >
            <span className="text-lg">{isMtn ? "🟡" : "🟠"}</span>
            {isMtn ? "MTN MoMo" : "Orange Money"}
        </button>
    );
}

// ── DirectPayForm ─────────────────────────────────────────────────────────────

function DirectPayForm({ amount, provider, phone, name, phoneError, onProviderChange, onPhoneChange, onNameChange, onPay, onRedirect }: {
    amount:   number;
    provider: Provider;
    phone:    string;
    name:     string;
    phoneError: boolean;
    onProviderChange: (p: Provider) => void;
    onPhoneChange:    (v: string)   => void;
    onNameChange:     (v: string)   => void;
    onPay:            ()            => void;
    onRedirect:       ()            => void;
}) {
    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Smartphone className="h-4 w-4" />
                    <p className="text-sm font-semibold">Paiement direct</p>
                </div>
                <p className="text-2xl font-extrabold">
                    {fmt(amount)} <span className="text-sm font-semibold text-muted-foreground">XAF</span>
                </p>
            </div>

            <div className="px-6 py-6 space-y-5">

                {/* Redirect button - top of form */}
                <Button
                    variant="outline"
                    onClick={onRedirect}
                    className="w-full gap-2 font-semibold rounded-xl text-sm"
                >
                    <ExternalLink className="h-4 w-4" />
                    Tester la redirection vers SharePay
                    <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">ou payer directement</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opérateur</p>
                    <div className="flex gap-3">
                        <ProviderButton provider="MTN_MOMO_CM"    selected={provider === "MTN_MOMO_CM"}    onClick={() => onProviderChange("MTN_MOMO_CM")} />
                        <ProviderButton provider="ORANGE_MONEY_CM" selected={provider === "ORANGE_MONEY_CM"} onClick={() => onProviderChange("ORANGE_MONEY_CM")} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Numéro de téléphone <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="237 6XX XXX XXX"
                        className={cn("h-10 text-sm font-mono", phoneError && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {phoneError && <p className="text-xs text-red-500">Le numéro est requis.</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom (optionnel)</label>
                    <Input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Jean Dupont"
                        className="h-10 text-sm"
                    />
                </div>

                <Button onClick={onPay} className="w-full h-11 text-sm font-extrabold rounded-xl gap-2 shadow-md">
                    Payer {fmt(amount)} XAF
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ── CheckoutModal ─────────────────────────────────────────────────────────────

function CheckoutModal({ amount, onPaid, onClose }: {
    amount: number;
    onPaid: (ref: string, provider: Provider, phone: string) => void;
    onClose: () => void;
}) {
    const [provider,   setProvider]   = useState<Provider>("MTN_MOMO_CM");
    const [phone,      setPhone]      = useState("");
    const [name,       setName]       = useState("");
    const [phoneError, setPhoneError] = useState(false);
    const [state,      setState]      = useState<"form" | "processing" | "success">("form");

    const pay = useCallback(async () => {
        if (!phone) { setPhoneError(true); return; }
        const ref = genRef();
        setState("processing");
        await new Promise((r) => setTimeout(r, 2_800));
        setState("success");
        setTimeout(() => onPaid(ref, provider, phone), 1_200);
    }, [phone, provider, onPaid]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6">
                            <Image src="/images/logo_sharepay_bg_remove_svg.svg" alt="SharePay" fill className="object-contain" />
                        </div>
                        <span className="font-extrabold text-sm text-primary">SharePay</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Lock className="h-3 w-3" />
                        <span>Paiement sécurisé</span>
                    </div>
                    {state === "form" && (
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ml-2">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Amount summary */}
                <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Service Demo SharePay</p>
                    <div className="flex items-center justify-between mt-1">
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">Paiement test</p>
                        <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
                            {fmt(amount)} <span className="text-sm font-bold text-zinc-500">XAF</span>
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                    {state === "form" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mode de paiement</p>
                                <div className="flex gap-2">
                                    <ProviderButton provider="MTN_MOMO_CM"    selected={provider === "MTN_MOMO_CM"}    onClick={() => setProvider("MTN_MOMO_CM")} />
                                    <ProviderButton provider="ORANGE_MONEY_CM" selected={provider === "ORANGE_MONEY_CM"} onClick={() => setProvider("ORANGE_MONEY_CM")} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Numéro de téléphone <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value); setPhoneError(false); }}
                                    placeholder="237 6XX XXX XXX"
                                    className={cn(
                                        "h-11 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
                                        phoneError && "border-red-400 focus-visible:ring-red-400",
                                    )}
                                />
                                {phoneError && <p className="text-xs text-red-500">Numéro requis</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nom (optionnel)</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jean Dupont"
                                    className="h-11 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                />
                            </div>
                            <Button onClick={pay} className="w-full h-12 text-base font-extrabold rounded-xl gap-2 shadow-lg mt-2">
                                Payer {fmt(amount)} XAF
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {state === "processing" && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Smartphone className="h-7 w-7 text-primary animate-pulse" />
                            </div>
                            <div className="text-center space-y-1.5">
                                <p className="font-bold text-base">Invite USSD envoyée</p>
                                <p className="text-sm text-muted-foreground">
                                    Confirmez le paiement sur votre téléphone{phone ? ` (${phone})` : ""}.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}

                    {state === "success" && (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
                                <Check className="h-8 w-8 text-emerald-500" />
                            </div>
                            <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">Paiement confirmé !</p>
                            <p className="text-xs text-muted-foreground">Retour en cours…</p>
                        </div>
                    )}
                </div>

                <div className="px-5 pb-4 text-center">
                    <p className="text-[11px] text-zinc-400">
                        Propulsé par <span className="font-bold text-primary">SharePay</span> · 256-bit SSL
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── ProcessingScreen ──────────────────────────────────────────────────────────

function ProcessingScreen({ provider, phone }: { provider: Provider; phone: string }) {
    return (
        <div className="flex flex-col items-center gap-6 py-20 animate-in fade-in duration-300">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <div className="text-center space-y-2">
                <p className="text-xl font-bold">Invite USSD envoyée</p>
                <p className="text-muted-foreground">Confirmez le paiement sur votre téléphone</p>
                {phone && (
                    <p className="text-sm font-mono font-semibold bg-muted/60 border rounded-lg px-4 py-2 inline-block">
                        {provider === "MTN_MOMO_CM" ? "🟡 MTN" : "🟠 Orange"} · {phone}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    );
}

// ── SuccessScreen ─────────────────────────────────────────────────────────────

function SuccessScreen({ amount, ref, provider, phone, onReset }: {
    amount: number; ref: string; provider: Provider; phone: string; onReset: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-6 py-16 animate-in fade-in zoom-in-95 duration-400">
            <div className="h-24 w-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center">
                <Check className="h-12 w-12 text-emerald-500" strokeWidth={3} />
            </div>

            <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold">Paiement réussi !</p>
                <p className="text-muted-foreground">La transaction a été confirmée avec succès.</p>
            </div>

            <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
                <div className="px-5 py-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Montant</span>
                        <span className="font-extrabold text-lg">{fmt(amount)} XAF</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Référence</span>
                        <span className="font-mono text-sm font-bold">{ref}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Payeur</span>
                        <span className="font-mono text-sm">{phone}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-border">
                        <span className="text-sm text-muted-foreground">Méthode</span>
                        <span className="text-sm font-semibold">
                            {provider === "MTN_MOMO_CM" ? "🟡 MTN MoMo" : "🟠 Orange Money"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-2">
                <Webhook className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">Webhook <code>payment.success</code> envoyé au marchand</span>
            </div>

            <Button variant="outline" onClick={onReset} className="gap-2 rounded-xl font-semibold">
                <RefreshCw className="h-4 w-4" />
                Tester un autre montant
            </Button>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function SubscriptionDemo() {
    const [step,         setStep]         = useState<DemoStep>("amounts");
    const [amount,       setAmount]       = useState<number>(0);
const [provider,     setProvider]     = useState<Provider>("MTN_MOMO_CM");
    const [phone,        setPhone]        = useState("");
    const [name,         setName]         = useState("");
    const [phoneError,   setPhoneError]   = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [subRef,       setSubRef]       = useState("");

    const handleAmountSelect = (n: number) => {
        setAmount(n);
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDirectPay = useCallback(async () => {
        if (!phone) { setPhoneError(true); return; }
        const ref = genRef();
        setSubRef(ref);
        setStep("processing");
        await new Promise((r) => setTimeout(r, 2_800));
        setStep("success");
    }, [phone]);

    const handleCheckoutPaid = useCallback((ref: string, p: Provider, ph: string) => {
        setSubRef(ref);
        setProvider(p);
        setPhone(ph);
        setShowCheckout(false);
        setStep("success");
    }, []);

    const reset = () => {
        setStep("amounts"); setAmount(0);
        setProvider("MTN_MOMO_CM"); setPhone(""); setName("");
        setPhoneError(false); setShowCheckout(false); setSubRef("");
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-24">

            {/* ── Amounts ─────────────────────────────────────────────────── */}
            {step === "amounts" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="text-center mb-10">
                        <p className="text-muted-foreground text-sm">Sélectionnez un montant pour tester le paiement.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {AMOUNT_CONFIG.map(({ amount, gradient, shadow }) => (
                            <AmountCard key={amount} amount={amount} gradient={gradient} shadow={shadow} onTest={() => handleAmountSelect(amount)} />
                        ))}
                        <CustomAmountCard onTest={handleAmountSelect} />
                    </div>
                </div>
            )}

            {/* ── Payment ──────────────────────────────────────────────────── */}
            {step === "payment" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-6">
                    <button
                        onClick={() => setStep("amounts")}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Changer de montant
                    </button>

                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <DirectPayForm
                                amount={amount}
                                provider={provider}
                                phone={phone}
                                name={name}
                                phoneError={phoneError}
                                onProviderChange={setProvider}
                                onPhoneChange={(v) => { setPhone(v); setPhoneError(false); }}
                                onNameChange={setName}
                                onPay={handleDirectPay}
                                onRedirect={() => setShowCheckout(true)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Processing ───────────────────────────────────────────────── */}
            {step === "processing" && (
                <ProcessingScreen provider={provider} phone={phone} />
            )}

            {/* ── Success ──────────────────────────────────────────────────── */}
            {step === "success" && (
                <SuccessScreen
                    amount={amount}
                    ref={subRef}
                    provider={provider}
                    phone={phone}
                    onReset={reset}
                />
            )}

            {/* ── Checkout modal ───────────────────────────────────────────── */}
            {showCheckout && (
                <CheckoutModal
                    amount={amount}
                    onPaid={handleCheckoutPaid}
                    onClose={() => setShowCheckout(false)}
                />
            )}
        </div>
    );
}
