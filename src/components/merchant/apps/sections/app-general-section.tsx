"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppWindow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";

function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

interface AppGeneralSectionProps {
    name: string;
    setName: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    websiteUrl: string;
    setWebsiteUrl: (val: string) => void;
    currency: string;
    nameError?: string;
    descError?: string;
    forceShowWebsiteUrlError?: boolean;
}

export function AppGeneralSection({
    name,
    setName,
    description,
    setDescription,
    websiteUrl,
    setWebsiteUrl,
    currency,
    nameError,
    descError,
    forceShowWebsiteUrlError,
}: AppGeneralSectionProps) {
    const t = useTranslations("Dashboard.Apps.Form.General");
    const [websiteUrlTouched, setWebsiteUrlTouched] = useState(false);

    const websiteUrlError =
        (websiteUrlTouched || forceShowWebsiteUrlError) && websiteUrl.trim() !== "" && !isValidUrl(websiteUrl.trim());

    return (
        <section className="flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <AppWindow className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold">{t("title")}</h3>
            </div>

            <div className="flex-1 bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
                {/* Name */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="appName">
                                {t("nameLabel")} <span className="text-primary">*</span>
                            </Label>
                            <InfoTooltip text={t("nameTooltip")} />
                        </div>
                        <span className={`text-xs tabular-nums ${name.length >= 50 ? "text-destructive" : "text-muted-foreground"}`}>
                            {name.length}/50
                        </span>
                    </div>
                    <Input
                        id="appName"
                        placeholder={t("namePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 50))}
                        maxLength={50}
                        className={`bg-background ${nameError ? "border-destructive" : ""}`}
                    />
                    {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="appDescription">
                                {t("descLabel")} <span className="text-primary">*</span>
                            </Label>
                            <InfoTooltip text={t("descTooltip")} />
                        </div>
                        <span className={`text-xs tabular-nums ${description.length >= 100 ? "text-destructive" : "text-muted-foreground"}`}>
                            {description.length}/100
                        </span>
                    </div>
                    <textarea
                        id="appDescription"
                        className={`flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${descError ? "border-destructive" : "border-input"}`}
                        placeholder={t("descPlaceholder")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                        maxLength={100}
                    />
                    {descError && <p className="text-xs text-destructive">{descError}</p>}
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="appWebsiteUrl">{t("websiteUrlLabel")}</Label>
                        <InfoTooltip text={t("websiteUrlTooltip")} />
                    </div>
                    <Input
                        id="appWebsiteUrl"
                        placeholder={t("websiteUrlPlaceholder")}
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        onBlur={() => setWebsiteUrlTouched(true)}
                        className={`bg-background ${websiteUrlError ? "border-destructive" : ""}`}
                    />
                    {websiteUrlError && <p className="text-xs text-destructive">{t("websiteUrlInvalid")}</p>}
                </div>

                {/* Currency - always read-only */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label>
                            {t("currencyLabel")} <span className="text-primary">*</span>
                        </Label>
                        <InfoTooltip text={t("currencyTooltip")} />
                    </div>
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-mono">
                        {currency}
                    </div>
                </div>
            </div>
        </section>
    );
}
