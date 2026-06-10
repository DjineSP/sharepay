"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Zap, AlarmClockCheck, BarChart3, Hand, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWithdrawalConfig } from "@/features/merchant/withdrawals/hooks/use-withdrawal-config";
import { useWithdrawalAccounts } from "@/features/merchant/withdrawals/hooks/use-withdrawal-accounts";
import { withdrawalsService } from "@/features/merchant/withdrawals/services/withdrawals.service";
import { WithdrawalMode } from "@/features/merchant/withdrawals/types";

type ConfigType = WithdrawalMode;

interface ConfigOption {
    id: ConfigType;
    icon: React.ReactNode;
    recommended?: boolean;
}

const OPTIONS: ConfigOption[] = [
    { id: "MANUAL",    icon: <Hand className="h-5 w-5" />,          recommended: true },
    { id: "INSTANT",   icon: <Zap className="h-5 w-5" /> },
    { id: "THRESHOLD", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "PERIODIC",  icon: <AlarmClockCheck className="h-5 w-5" /> },
];

const MODE_KEY: Record<ConfigType, string> = {
    MANUAL:    "manual",
    INSTANT:   "instant",
    THRESHOLD: "threshold",
    PERIODIC:  "periodic",
};

export function WithdrawalsConfigPage() {
    const t = useTranslations("Dashboard.Withdrawals");

    const { config, loading: configLoading, refetch: refetchConfig } = useWithdrawalConfig();
    const { accounts, loading: accountsLoading }                     = useWithdrawalAccounts();

    const [selected,    setSelected]    = useState<ConfigType>("MANUAL");
    const [accountId,   setAccountId]   = useState<string>("");
    const [threshold,   setThreshold]   = useState("");
    const [period,      setPeriod]      = useState("MONTHLY");
    const [saving,      setSaving]      = useState(false);

    // Initialiser le formulaire depuis la config chargée
    useEffect(() => {
        if (!configLoading) {
            setSelected(config.mode);
            setAccountId(config.account?.id ?? "");
            setThreshold(config.thresholdAmount ? String(config.thresholdAmount) : "");
            setPeriod(config.period ?? "MONTHLY");
        }
    }, [config, configLoading]);

    const handleSave = async () => {
        const needsAccount = selected !== "MANUAL";
        if (needsAccount && !accountId) {
            toast.error(t("ConfigPage.errorAccountRequired"));
            return;
        }
        if (selected === "THRESHOLD" && (!threshold || parseInt(threshold) <= 0)) {
            toast.error(t("ConfigPage.errorThresholdRequired"));
            return;
        }

        setSaving(true);
        try {
            await withdrawalsService.updateConfig({
                mode: selected,
                accountId: needsAccount ? accountId : null,
                thresholdAmount: selected === "THRESHOLD" ? parseInt(threshold) : null,
                period: selected === "PERIODIC" ? period : null,
            });
            await refetchConfig();
            toast.success(t("ConfigPage.saved"));
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (configLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const needsAccount = selected !== "MANUAL";

    return (
        <div className="space-y-8">
            {/* Page Heading */}
            <div>
                <Link href="/merchant/withdrawals">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2 mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t("ConfigPage.back")}
                    </Button>
                </Link>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground truncate">
                    {t("ConfigPage.title")}
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-1 truncate">
                    {t("ConfigPage.subtitle")}
                </p>
            </div>

            {/* Mode cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {OPTIONS.map((opt) => {
                    const isSelected = selected === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelected(opt.id)}
                            className={cn(
                                "w-full text-left rounded-xl border-2 p-5 transition-all",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-2 rounded-lg shrink-0 mt-0.5",
                                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    {opt.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={cn(
                                            "font-semibold text-sm sm:text-base",
                                            isSelected ? "text-primary" : "text-foreground"
                                        )}>
                                            {t(`ConfigModal.types.${MODE_KEY[opt.id]}`)}
                                        </span>
                                        {opt.recommended && (
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {t("ConfigPage.recommended")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                                        {t(`ConfigModal.descriptions.${MODE_KEY[opt.id]}`)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Paramètres spécifiques au mode sélectionné */}
            {needsAccount && (
                <Card className="max-w-2xl">
                    <CardContent className="pt-6 space-y-5">
                        {/* Compte cible */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                {t("ConfigModal.fields.destination")}
                            </Label>
                            {accountsLoading ? (
                                <div className="h-11 rounded-lg bg-muted/50 animate-pulse" />
                            ) : accounts.length === 0 ? (
                                <div className="h-11 flex items-center px-3 rounded-md border border-dashed text-sm text-muted-foreground">
                                    {t("ConfigPage.noAccountsHint")}
                                </div>
                            ) : (
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder={t("ConfigModal.fields.destinationPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                <span className="font-medium">{acc.providerName}</span>
                                                <span className="text-muted-foreground ml-2 font-mono text-xs">
                                                    {acc.accountNumber} - {acc.accountName}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Seuil (THRESHOLD uniquement) */}
                        {selected === "THRESHOLD" && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {t("ConfigModal.fields.thresholdAmount")}
                                </Label>
                                <div className="relative max-w-xs">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder={t("ConfigModal.fields.thresholdAmountPlaceholder")}
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ""))}
                                        className="h-11 pr-16"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                        FCFA
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Périodicité (PERIODIC uniquement) */}
                        {selected === "PERIODIC" && (
                            <div className="space-y-2 max-w-xs">
                                <Label className="text-sm font-medium">
                                    {t("ConfigModal.fields.period")}
                                </Label>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">{t("ConfigModal.fields.daily")}</SelectItem>
                                        <SelectItem value="WEEKLY">{t("ConfigModal.fields.weekly")}</SelectItem>
                                        <SelectItem value="MONTHLY">{t("ConfigModal.fields.monthly")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Sauvegarde */}
            <div className="max-w-2xl">
                <Button
                    size="lg"
                    className="px-8 font-semibold rounded-xl shadow-md"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t("ConfigModal.fields.save")}
                </Button>
            </div>
        </div>
    );
}
