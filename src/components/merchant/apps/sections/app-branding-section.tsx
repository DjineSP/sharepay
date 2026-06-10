"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette, Upload, X } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

interface AppBrandingSectionProps {
    logoUrlInput: string;
    setLogoUrlInput: (val: string) => void;
    simple?: boolean;
    forceShowErrors?: boolean;
    // Full mode only (optional when simple={true})
    themeColor?: string;
    setThemeColor?: (val: string) => void;
    logoMode?: "none" | "upload" | "url";
    setLogoMode?: (val: "none" | "upload" | "url") => void;
    setLogoDataUrl?: (val: string) => void;
    logoDataUrl?: string;
}

const PRESET_COLORS = ["#088a5c", "#0f172a", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];

export function AppBrandingSection({
    logoUrlInput,
    setLogoUrlInput,
    simple = false,
    forceShowErrors,
    themeColor = "#088a5c",
    setThemeColor = () => {},
    logoMode = "none",
    setLogoMode = () => {},
    setLogoDataUrl = () => {},
    logoDataUrl = "",
}: AppBrandingSectionProps) {
    const t = useTranslations("Dashboard.Apps.Form.Branding");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoUrlTouched, setLogoUrlTouched] = useState(false);

    const logoUrlError =
        (logoUrlTouched || forceShowErrors) && logoUrlInput.trim() !== "" && !isValidUrl(logoUrlInput.trim());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setLogoDataUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleClearLogo = () => {
        setLogoDataUrl("");
        setLogoUrlInput("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const logoPreview = logoMode === "url" ? logoUrlInput : logoMode === "upload" ? logoDataUrl : undefined;

    // ── Simple mode (create page - logo URL + theme color) ───────────────────
    if (simple) {
        return (
            <section className="flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <Palette className="text-primary w-6 h-6" />
                    <h3 className="text-lg font-bold">{t("title")}</h3>
                </div>

                <div className="flex-1 bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
                    {/* Logo URL */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Label>{t("logo")}</Label>
                            <InfoTooltip text={t("logoTooltip")} />
                        </div>
                        <Input
                            placeholder="https://example.com/logo.png"
                            value={logoUrlInput}
                            onChange={(e) => setLogoUrlInput(e.target.value)}
                            onBlur={() => setLogoUrlTouched(true)}
                            className={`bg-background ${logoUrlError ? "border-destructive" : ""}`}
                        />
                        {logoUrlError && (
                            <p className="text-xs text-destructive">{t("logoUrlInvalid")}</p>
                        )}
                    </div>

                    {/* Logo preview / default */}
                    {logoUrlInput ? (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t("logoPreviewLabel")}</Label>
                            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl border border-border bg-background overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={logoUrlInput}
                                    alt="Logo preview"
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setLogoUrlInput("")}
                                    className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 bg-destructive/90 rounded-full text-white"
                                    title={t("logoRemove")}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl border border-border bg-background overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/logo_sharepay_bg_remove_svg.svg"
                                    alt="SharePay logo (défaut)"
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{t("logoDefaultCaption")}</p>
                        </div>
                    )}

                    {/* Theme color */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                            <Label>{t("themeColor")}</Label>
                            <InfoTooltip text={t("themeColorTooltip")} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    title={color}
                                    onClick={() => setThemeColor(color)}
                                    className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                                    style={{
                                        backgroundColor: color,
                                        borderColor: themeColor === color ? "white" : "transparent",
                                        outline: themeColor === color ? `2px solid ${color}` : "none",
                                        outlineOffset: "2px",
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="h-9 w-10 rounded cursor-pointer border border-border p-0.5 bg-background"
                            />
                            <Input
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="font-mono uppercase bg-background"
                                maxLength={7}
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ── Full mode (edit page) ─────────────────────────────────────────────────
    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <Palette className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold">{t("title")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-xl border border-border shadow-sm">

                {/* ── Logo ─────────────────────────────────────── */}
                <div className="space-y-4">
                    <Label>{t("logo")}</Label>

                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={logoMode}
                        onChange={(e) => {
                            setLogoMode(e.target.value as "none" | "upload" | "url");
                            handleClearLogo();
                        }}
                    >
                        <option value="none">{t("logoNone")}</option>
                        <option value="url">{t("logoUrl")}</option>
                        <option value="upload">{t("logoUpload")}</option>
                    </select>

                    {logoMode === "url" && (
                        <Input
                            placeholder="https://example.com/logo.png"
                            value={logoUrlInput}
                            onChange={(e) => setLogoUrlInput(e.target.value)}
                            className="bg-background"
                        />
                    )}

                    {logoMode === "upload" && (
                        <div className="space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-4 h-4" />
                                {logoDataUrl ? t("logoChangeFile") : t("logoSelectFile")}
                            </Button>
                            <p className="text-xs text-muted-foreground">{t("logoFileTypes")}</p>
                        </div>
                    )}

                    {logoPreview && (
                        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-xl border border-border bg-background overflow-hidden group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-full h-full object-contain p-1"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <button
                                type="button"
                                onClick={handleClearLogo}
                                className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 bg-destructive/90 rounded-full text-white"
                                title={t("logoRemove")}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {logoMode === "none" && (
                        <div className="flex flex-col items-start gap-2">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl border border-border bg-background overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/logo_sharepay_bg_remove_svg.svg"
                                    alt="SharePay logo (défaut)"
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{t("logoDefaultCaption")}</p>
                        </div>
                    )}
                </div>

                {/* ── Theme Color ──────────────────────────────── */}
                <div className="space-y-4">
                    <Label>{t("themeColor")}</Label>

                    <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                title={color}
                                onClick={() => setThemeColor(color)}
                                className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                                style={{
                                    backgroundColor: color,
                                    borderColor: themeColor === color ? "white" : "transparent",
                                    outline: themeColor === color ? `2px solid ${color}` : "none",
                                    outlineOffset: "2px",
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="h-10 w-12 rounded cursor-pointer border border-border p-0.5 bg-background"
                        />
                        <Input
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="font-mono uppercase bg-background"
                            maxLength={7}
                            placeholder="#000000"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
