"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Download, CheckCircle2, ShieldAlert, KeyRound, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ApiKeysRevealModalProps {
    webhookSecret?: string;  // plainTextWebhookSecret - visible once at creation
    apiKey?: string;         // full API key - visible once at generation/rotation
    subtitle?: string;       // override the subtitle line
    onConfirm: () => void;
}

export function ApiKeysRevealModal({ webhookSecret, apiKey, subtitle, onConfirm }: ApiKeysRevealModalProps) {
    const t = useTranslations("Dashboard.Apps.Form.KeysModal");
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [copiedApi, setCopiedApi] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const copy = (text: string, type: "webhook" | "api") => {
        navigator.clipboard.writeText(text).then(() => {
            if (type === "webhook") {
                setCopiedWebhook(true);
                setTimeout(() => setCopiedWebhook(false), 2000);
            } else {
                setCopiedApi(true);
                setTimeout(() => setCopiedApi(false), 2000);
            }
            toast.success(t("copied"));
        });
    };

    const download = () => {
        const lines: string[] = ["SharePay - Secrets\n==================\n"];
        if (webhookSecret) lines.push(`Webhook Secret:\n${webhookSecret}`);
        if (apiKey) lines.push(`\nAPI Key:\n${apiKey}`);
        lines.push("\n\n⚠️  Ne partagez jamais ces informations. Ne les committez pas dans votre code source.");
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sharepay-secrets.txt";
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("downloaded"));
    };

    const handleConfirm = () => {
        if (!confirmed) { setConfirmed(true); return; }
        onConfirm();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-6 pb-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{t("title")}</h2>
                        <p className="text-sm text-muted-foreground">{subtitle ?? t("appCreated")}</p>
                    </div>
                </div>

                {/* Warning */}
                <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed">{t("warning")}</p>
                </div>

                {/* Secrets */}
                <div className="p-6 space-y-4">

                    {webhookSecret && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <Webhook className="w-3.5 h-3.5 text-muted-foreground" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("webhookSecret")}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{t("webhookSecretDesc")}</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono truncate">
                                    {webhookSecret}
                                </code>
                                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => copy(webhookSecret, "webhook")}>
                                    {copiedWebhook ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {apiKey && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("apiKey")}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{t("apiKeyDesc")}</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono truncate">
                                    {apiKey}
                                </code>
                                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => copy(apiKey, "api")}>
                                    {copiedApi ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button type="button" variant="outline" className="w-full gap-2" onClick={download}>
                        <Download className="w-4 h-4" />
                        {t("download")}
                    </Button>
                </div>

                {/* Confirm footer */}
                <div className="px-6 pb-6 space-y-3">
                    {confirmed && (
                        <p className="text-xs text-center text-muted-foreground">{t("confirmOnce")}</p>
                    )}
                    <Button
                        type="button"
                        className={`w-full h-12 font-bold text-sm ${confirmed ? "bg-green-600 hover:bg-green-700" : ""}`}
                        onClick={handleConfirm}
                    >
                        {confirmed ? t("confirmFinal") : t("confirmSaved")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
