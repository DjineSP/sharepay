"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWithdrawalConfig } from "@/features/merchant/withdrawals/hooks/use-withdrawal-config";
import { useWithdrawalAccounts } from "@/features/merchant/withdrawals/hooks/use-withdrawal-accounts";
import { withdrawalsService } from "@/features/merchant/withdrawals/services/withdrawals.service";
import { WithdrawalMode } from "@/features/merchant/withdrawals/types";

type ConfigType = WithdrawalMode;

const MODE_KEY: Record<ConfigType, string> = {
    MANUAL:    "manual",
    INSTANT:   "instant",
    THRESHOLD: "threshold",
    PERIODIC:  "periodic",
};

interface WithdrawalsConfigModalProps {
    open: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

export function WithdrawalsConfigModal({ open, onClose, onSaved }: WithdrawalsConfigModalProps) {
    const t = useTranslations("Dashboard.Withdrawals");

    const { config, loading: configLoading, refetch: refetchConfig } = useWithdrawalConfig();
    const { accounts, loading: accountsLoading }                     = useWithdrawalAccounts();

    const [selected,  setSelected]  = useState<ConfigType>("MANUAL");
    const [accountId, setAccountId] = useState("");
    const [threshold, setThreshold] = useState("");
    const [period,    setPeriod]    = useState("MONTHLY");
    const [saving,    setSaving]    = useState(false);

    useEffect(() => {
        if (open && !configLoading) {
            setSelected(config.mode);
            const fallbackId = accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? "";
            setAccountId(config.account?.id ?? fallbackId);
            setThreshold(config.thresholdAmount ? String(config.thresholdAmount) : "");
            setPeriod(config.period ?? "MONTHLY");
        }
    }, [open, config, configLoading, accounts]);

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
            onSaved?.();
            onClose();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    function AccountSelect() {
        if (accountsLoading) return <Skeleton className="h-11 w-full rounded-md" />;
        if (accounts.length === 0) return (
            <div className="h-11 flex items-center px-3 rounded-md border border-dashed text-sm text-muted-foreground">
                {t("ConfigPage.noAccountsHint")}
            </div>
        );
        return (
            <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-11">
                    <SelectValue placeholder={t("ConfigModal.fields.destinationPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="items-start">
                            <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate">
                                    {acc.accountName}
                                    {acc.isDefault && <span className="ml-1.5 text-[10px] font-bold text-amber-500">★</span>}
                                </span>
                                <span className="text-muted-foreground font-mono text-xs truncate">
                                    {acc.accountNumber} · {acc.providerName}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[90vh] flex flex-col gap-0 p-0">

                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold leading-tight">
                                {t("ConfigModal.title")}
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-0.5">
                                {t("ConfigPage.subtitle")}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {configLoading ? (
                        <div className="space-y-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Skeleton className="h-4 w-4 rounded-full mt-0.5 shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <RadioGroup
                            value={selected}
                            onValueChange={(v) => setSelected(v as ConfigType)}
                            className="gap-0 divide-y"
                        >
                            {(["MANUAL", "INSTANT", "THRESHOLD", "PERIODIC"] as ConfigType[]).map((mode) => (
                                <div key={mode} className="py-4 first:pt-0 last:pb-0">
                                    <label htmlFor={mode} className="flex items-start gap-3 cursor-pointer">
                                        <RadioGroupItem id={mode} value={mode} className="mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {t(`ConfigModal.types.${MODE_KEY[mode]}`)}
                                                </span>
                                                {mode === "MANUAL" && (
                                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        {t("ConfigPage.recommended")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed break-words">
                                                {t(`ConfigModal.descriptions.${MODE_KEY[mode]}`)}
                                            </p>
                                        </div>
                                    </label>

                                    {/* Champs supplémentaires - visibles uniquement si sélectionné */}
                                    {selected === mode && mode !== "MANUAL" && (
                                        <div className="mt-4 ml-7 space-y-3">
                                            {mode === "THRESHOLD" && (
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm font-medium">
                                                        {t("ConfigModal.fields.thresholdAmount")}
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            placeholder={t("ConfigModal.fields.thresholdAmountPlaceholder")}
                                                            value={threshold}
                                                            onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ""))}
                                                            className="pr-14"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                                            XAF
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {mode === "PERIODIC" && (
                                                <div className="space-y-1.5">
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

                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">
                                                    {t("ConfigModal.fields.destination")}
                                                </Label>
                                                <AccountSelect />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
                    <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1 sm:flex-none">
                        {t("ConfigModal.cancel")}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || configLoading}
                        className="flex-1 sm:flex-none font-semibold"
                    >
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t("ConfigModal.fields.save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
