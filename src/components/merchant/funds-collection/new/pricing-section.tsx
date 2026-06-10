import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PricingSectionProps {
    amountType: "fixed" | "free";
    setAmountType: (value: "fixed" | "free") => void;
    amount: string;
    setAmount: (value: string) => void;
    amountError?: string;
}

export function PricingSection({
    amountType,
    setAmountType,
    amount,
    setAmount,
    amountError,
}: PricingSectionProps) {
    const t = useTranslations('Dashboard.FundsCollection.New');

    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <CreditCard className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold">{t("sectionPricing")}</h3>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t("typeLabel")}</Label>
                        <Select value={amountType} onValueChange={(v) => setAmountType(v as "fixed" | "free")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">{t("typeFixed")}</SelectItem>
                                <SelectItem value="free">{t("typeFree")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Label>{t("currencyLabel")}</Label>
                            <InfoTooltip text={t("currencyTooltip")} />
                        </div>
                        <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-mono">
                            XAF - FCFA
                        </div>
                    </div>
                </div>

                {amountType === "fixed" && (
                    <div className="space-y-2">
                        <Label>{t("priceLabel")}</Label>
                        <Input
                            type="number"
                            placeholder={t("pricePlaceholder")}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`text-lg font-bold ${amountError ? "border-destructive" : ""}`}
                        />
                        {amountError && <p className="text-xs text-destructive">{amountError}</p>}
                    </div>
                )}
            </div>
        </section>
    );
}
