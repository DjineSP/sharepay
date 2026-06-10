"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    Webhook, RefreshCw, Trash2, Sparkles, Loader2,
    ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, Copy, CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ApiKeysRevealModal } from "@/components/merchant/apps/api-keys-reveal-modal";

import { useWebhook } from "@/features/merchant/apps/hooks/use-webhook";
import { webhookService } from "@/features/merchant/apps/services/webhook.service";
import {
    WebhookDeliveryResponse,
    WebhookDeliveryStatus,
    SpringPage,
} from "@/features/merchant/apps/types";
import { resolveError } from "@/lib/api/response-codes";

interface AppWebhooksSectionProps {
    appId: string;
    webhookUrl: string;
    setWebhookUrl: (val: string) => void;
    forceShowErrors?: boolean;
}

function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

// ── Delivery status badge ──────────────────────────────────────────────────────
function DeliveryStatusBadge({ status }: { status: WebhookDeliveryStatus }) {
    const t = useTranslations("Dashboard.Apps.Form.Webhooks.Deliveries");
    const map: Record<WebhookDeliveryStatus, string> = {
        DELIVERED: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
        FAILED:    "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        PENDING:   "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
    const labels: Record<WebhookDeliveryStatus, string> = {
        DELIVERED: t("statusDelivered"),
        FAILED:    t("statusFailed"),
        PENDING:   t("statusPending"),
    };
    return (
        <Badge variant="outline" className={`text-xs font-medium ${map[status]}`}>
            {labels[status]}
        </Badge>
    );
}

// ── Deliveries table ───────────────────────────────────────────────────────────
function DeliveriesTable({ appId }: { appId: string }) {
    const t = useTranslations("Dashboard.Apps.Form.Webhooks.Deliveries");
    const tGlobal = useTranslations();

    const [page, setPage] = useState(0);
    const [data, setData] = useState<SpringPage<WebhookDeliveryResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [replayingId, setReplayingId] = useState<string | null>(null);

    const load = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const result = await webhookService.listDeliveries(appId, { page: p, size: 8 });
            setData(result);
            setPage(p);
        } catch (err) {
            const { messageKey, values } = resolveError(err);
            toast.error(tGlobal(messageKey, values));
        } finally {
            setLoading(false);
        }
    }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load(0); }, [load]);

    const handleReplay = async (deliveryId: string) => {
        setReplayingId(deliveryId);
        try {
            await webhookService.replayDelivery(appId, deliveryId);
            toast.success(t("replaySuccess"));
            load(page);
        } catch (err) {
            const { messageKey, values } = resolveError(err);
            toast.error(tGlobal(messageKey, values));
        } finally {
            setReplayingId(null);
        }
    };

    if (loading && !data) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (!data || data.content.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-6">{t("empty")}</p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/40">
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t("event")}</th>
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t("status")}</th>
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t("httpStatus")}</th>
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t("attempts")}</th>
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t("date")}</th>
                            <th className="px-4 py-2.5" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.content.map((d) => (
                            <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-2.5 font-mono text-xs">{d.eventName}</td>
                                <td className="px-4 py-2.5"><DeliveryStatusBadge status={d.status} /></td>
                                <td className="px-4 py-2.5 text-muted-foreground">{d.httpStatus ?? "-"}</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{d.attemptCount}</td>
                                <td className="px-4 py-2.5 text-muted-foreground text-xs">
                                    {new Date(d.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    <Button
                                        type="button" variant="ghost" size="sm"
                                        className="h-7 gap-1.5 text-xs"
                                        disabled={replayingId === d.id}
                                        onClick={() => handleReplay(d.id)}
                                    >
                                        {replayingId === d.id
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <RotateCcw className="w-3 h-3" />
                                        }
                                        {t("replay")}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{data.totalElements} {t("total")}</span>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button" variant="outline" size="icon" className="h-7 w-7"
                            disabled={data.first || loading}
                            onClick={() => load(page - 1)}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <span className="px-2">{page + 1} / {data.totalPages}</span>
                        <Button
                            type="button" variant="outline" size="icon" className="h-7 w-7"
                            disabled={data.last || loading}
                            onClick={() => load(page + 1)}
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main section ───────────────────────────────────────────────────────────────
export function AppWebhooksSection({ appId, webhookUrl, setWebhookUrl, forceShowErrors }: AppWebhooksSectionProps) {
    const t = useTranslations("Dashboard.Apps.Form.Webhooks");
    const tSecret = useTranslations("Dashboard.Apps.Form.Webhooks.Secret");
    const tGlobal = useTranslations();

    const { config, setConfig, loading } = useWebhook(appId);

    // URL
    const [urlTouched, setUrlTouched] = useState(false);

    // Copy prefix
    const [copied, setCopied] = useState(false);
    const handleCopyPrefix = () => {
        if (!config?.webhookSecretPrefix) return;
        navigator.clipboard.writeText(config.webhookSecretPrefix).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success(tSecret("copied"));
        });
    };

    // Secret actions
    const [secretAction, setSecretAction] = useState<"create" | "rotate" | "revoke" | null>(null);
    const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
    const [showRotateModal, setShowRotateModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);

    const hasSecret = !!config?.webhookSecretPrefix;
    const urlError  = (urlTouched || forceShowErrors) && webhookUrl.trim() !== "" && !isValidUrl(webhookUrl.trim());

    // ── Secret handlers ────────────────────────────────────────────────────────
    const handleCreateSecret = async () => {
        setSecretAction("create");
        try {
            const res = await webhookService.createSecret(appId);
            setConfig(res);
            setRevealedSecret(res.plainTextWebhookSecret ?? null);
            toast.success(tSecret("createSuccess"));
        } catch (err) {
            const { messageKey, values } = resolveError(err);
            toast.error(tGlobal(messageKey, values));
        } finally {
            setSecretAction(null);
        }
    };

    const handleRotateSecret = async () => {
        setShowRotateModal(false);
        setSecretAction("rotate");
        try {
            const res = await webhookService.rotateSecret(appId);
            setConfig(res);
            setRevealedSecret(res.plainTextWebhookSecret ?? null);
            toast.success(tSecret("rotateSuccess"));
        } catch (err) {
            const { messageKey, values } = resolveError(err);
            toast.error(tGlobal(messageKey, values));
        } finally {
            setSecretAction(null);
        }
    };

    const handleConfirmRevokeSecret = async () => {
        setShowRevokeModal(false);
        setSecretAction("revoke");
        try {
            await webhookService.revokeSecret(appId);
            setConfig(prev => prev ? { ...prev, webhookSecretPrefix: null, plainTextWebhookSecret: undefined } : prev);
            toast.success(tSecret("revokeSuccess"));
        } catch (err) {
            const { messageKey, values } = resolveError(err);
            toast.error(tGlobal(messageKey, values));
        } finally {
            setSecretAction(null);
        }
    };

    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <Webhook className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold">{t("title")}</h3>
            </div>

            <div className="space-y-6">

                {/* ── URL block ────────────────────────────────────────────── */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="webhookUrl">{t("urlLabel")}</Label>
                            <InfoTooltip text={t("urlDescription")} />
                        </div>
                        <Input
                            id="webhookUrl"
                            placeholder={t("urlPlaceholder")}
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            onBlur={() => setUrlTouched(true)}
                            className={`bg-background ${urlError ? "border-destructive" : ""}`}
                            disabled={loading}
                        />
                        {urlError && (
                            <p className="text-xs text-destructive">{t("urlInvalid")}</p>
                        )}
                    </div>
                </div>

                {/* ── Secret block ─────────────────────────────────────────── */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                    <div>
                        <p className="text-sm font-semibold">{tSecret("title")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tSecret("description")}</p>
                    </div>

                    {loading ? (
                        <Skeleton className="h-10 w-full rounded-lg" />
                    ) : hasSecret ? (
                        <>
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {tSecret("prefix")}
                                </span>
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
                                    <code className="flex-1 font-mono text-sm text-foreground truncate">
                                        {config?.webhookSecretPrefix}
                                        <span className="text-muted-foreground">••••••••••••••••••••</span>
                                    </code>
                                    <Button
                                        type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                                        onClick={handleCopyPrefix}
                                        disabled={secretAction !== null}
                                    >
                                        {copied
                                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            : <Copy className="w-3.5 h-3.5" />
                                        }
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        type="button" variant="outline" size="sm" className="gap-2"
                                        disabled={secretAction !== null}
                                        onClick={() => setShowRotateModal(true)}
                                    >
                                        {secretAction === "rotate"
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <RefreshCw className="w-4 h-4" />
                                        }
                                        {secretAction === "rotate" ? tSecret("rotating") : tSecret("rotateButton")}
                                    </Button>
                                    <Button
                                        type="button" variant="outline" size="sm"
                                        className="gap-2 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-400 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                        disabled={secretAction !== null}
                                        onClick={() => setShowRevokeModal(true)}
                                    >
                                        {secretAction === "revoke"
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                        {secretAction === "revoke" ? tSecret("revoking") : tSecret("revokeButton")}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-border bg-muted/5 text-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{tSecret("noSecret")}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{tSecret("noSecretDesc")}</p>
                            </div>
                            <Button
                                type="button" size="sm" className="gap-2 font-bold"
                                disabled={secretAction !== null}
                                onClick={handleCreateSecret}
                            >
                                {secretAction === "create"
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Webhook className="w-4 h-4" />
                                }
                                {secretAction === "create" ? tSecret("creating") : tSecret("createButton")}
                            </Button>
                        </div>
                    )}
                </div>

            </div>

            {/* Rotate secret confirmation modal */}
            <Dialog open={showRotateModal} onOpenChange={(open) => { if (!open) setShowRotateModal(false); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <DialogTitle>{tSecret("rotateModalTitle")}</DialogTitle>
                        </div>
                        <DialogDescription>{tSecret("rotateModalDesc")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={() => setShowRotateModal(false)}>
                            {tSecret("rotateModalCancel")}
                        </Button>
                        <Button type="button" variant="outline" className="gap-2 border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40" onClick={handleRotateSecret}>
                            <RefreshCw className="h-4 w-4" />
                            {tSecret("rotateModalConfirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revoke secret confirmation modal */}
            <Dialog open={showRevokeModal} onOpenChange={(open) => { if (!open) setShowRevokeModal(false); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <DialogTitle>{tSecret("revokeModalTitle")}</DialogTitle>
                        </div>
                        <DialogDescription>{tSecret("revokeModalDesc")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={() => setShowRevokeModal(false)}>
                            {tSecret("revokeModalCancel")}
                        </Button>
                        <Button type="button" variant="destructive" className="gap-2" onClick={handleConfirmRevokeSecret}>
                            <Trash2 className="h-4 w-4" />
                            {tSecret("revokeModalConfirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reveal modal */}
            {revealedSecret && (
                <ApiKeysRevealModal
                    webhookSecret={revealedSecret}
                    subtitle={tSecret("createSuccess")}
                    onConfirm={() => setRevealedSecret(null)}
                />
            )}
        </section>
    );
}
