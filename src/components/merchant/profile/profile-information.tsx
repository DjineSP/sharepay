"use client";

import { useState } from "react";
import { UserCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { PhoneInput } from "@/components/ui/phone-input";
import { accountService } from "@/lib/services/account.service";
import { MerchantProfile } from "@/lib/types/account.types";
import { isApiError } from "@/lib/api/error";
import { CountrySelect } from "@/components/ui/country-select";

interface ProfileInformationProps {
    profile?:        MerchantProfile | null;
    isLoading?:      boolean;
    onProfileUpdate: (p: MerchantProfile) => void;
}

function ProfileInformationSkeleton() {
    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-6 w-40" />
            </div>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
            </div>
        </section>
    );
}

export function ProfileInformation({ profile, isLoading, onProfileUpdate }: ProfileInformationProps) {
    if (isLoading || !profile) return <ProfileInformationSkeleton />;
    return <ProfileInformationForm profile={profile} onProfileUpdate={onProfileUpdate} />;
}

function ProfileInformationForm({ profile, onProfileUpdate }: { profile: MerchantProfile; onProfileUpdate: (p: MerchantProfile) => void }) {
    const t = useTranslations("Dashboard.Profile.Information");

    const [fullName, setFullName] = useState(profile.fullName);
    const [phone,    setPhone]    = useState(profile.phone ?? "");
    const [country,  setCountry]  = useState(profile.country ?? "");

    const [saving,  setSaving]  = useState(false);
    const [saved,   setSaved]   = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    const hasChanges =
        fullName !== profile.fullName ||
        phone    !== (profile.phone   ?? "") ||
        country  !== (profile.country ?? "");

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await accountService.updateProfile({
                fullName: fullName !== profile.fullName ? fullName : undefined,
                phone:    phone    !== (profile.phone   ?? "") ? phone   : undefined,
                country:  country  !== (profile.country ?? "") ? country : undefined,
            });
            onProfileUpdate(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            setError(isApiError(e) ? e.message : t("genericError"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <UserCircle className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold">{t("title")}</h3>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Nom complet */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>{t("fullName")}</Label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    {/* Email - lecture seule */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>{t("email")}</Label>
                        <div className="relative">
                            <Input
                                value={profile.email}
                                disabled
                                className="bg-muted text-muted-foreground cursor-not-allowed pr-28"
                            />
                            {profile.emailVerified && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-3.5 h-3.5" />
                                    {t("verified")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                        <Label>{t("phone")}</Label>
                        <PhoneInput value={phone} onChange={setPhone} className="w-full" />
                    </div>

                    {/* Pays */}
                    <div className="space-y-2">
                        <Label>{t("country")}</Label>
                        <CountrySelect value={country} onChange={setCountry} />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-28 gap-2"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />{t("save")}</>
                        ) : saved ? (
                            <><Check className="w-4 h-4" />{t("saved")}</>
                        ) : (
                            t("save")
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}
