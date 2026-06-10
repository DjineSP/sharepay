"use client";

import { useState } from "react";
import { ShieldCheck, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface ProfileKycSectionProps {
    email?:         string;
    phone?:         string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    isLoading?:     boolean;
}

function ProfileKycSkeleton() {
    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                {[0, 1].map(i => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
        </section>
    );
}

function VerifRow({
    icon: Icon,
    label,
    value,
    verified,
    onVerify,
    verifying,
    sent,
    verifiedLabel,
    unverifiedLabel,
    verifyLabel,
    sentLabel,
}: {
    icon:            React.ElementType;
    label:           string;
    value:           string;
    verified:        boolean;
    onVerify?:       () => void;
    verifying?:      boolean;
    sent?:           boolean;
    verifiedLabel:   string;
    unverifiedLabel: string;
    verifyLabel:     string;
    sentLabel:       string;
}) {
    return (
        <div className="flex items-center gap-4 px-6 py-4">
            <div className={`p-2.5 rounded-xl shrink-0 ${verified ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                <Icon className={`w-4 h-4 ${verified ? "text-emerald-500" : "text-amber-500"}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{value || "-"}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {verified ? (
                    <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            {verifiedLabel}
                        </span>
                    </>
                ) : sent ? (
                    <span className="text-xs text-muted-foreground italic">{sentLabel}</span>
                ) : (
                    <>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            {unverifiedLabel}
                        </span>
                        {onVerify && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onVerify}
                                disabled={verifying}
                                className="ml-1 text-xs gap-1.5 h-7 rounded-lg"
                            >
                                {verifying && <Loader2 className="w-3 h-3 animate-spin" />}
                                {verifyLabel}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export function ProfileKycSection({ email = "", phone = "", emailVerified = false, phoneVerified = false, isLoading }: ProfileKycSectionProps) {
    const t = useTranslations("Dashboard.Profile.Kyc");

    const [sendingEmail, setSendingEmail]   = useState(false);
    const [emailSent,    setEmailSent]      = useState(false);

    if (isLoading) return <ProfileKycSkeleton />;

    const handleVerifyEmail = async () => {
        setSendingEmail(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            setEmailSent(true);
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold">{t("title")}</h3>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                <VerifRow
                    icon={Mail}
                    label={t("emailLabel")}
                    value={email}
                    verified={emailVerified}
                    onVerify={!emailVerified ? handleVerifyEmail : undefined}
                    verifying={sendingEmail}
                    sent={emailSent}
                    verifiedLabel={t("verified")}
                    unverifiedLabel={t("unverified")}
                    verifyLabel={t("verify")}
                    sentLabel={t("linkSent")}
                />
                <VerifRow
                    icon={Phone}
                    label={t("phoneLabel")}
                    value={phone}
                    verified={phoneVerified}
                    verifiedLabel={t("verified")}
                    unverifiedLabel={t("unverified")}
                    verifyLabel={t("verify")}
                    sentLabel={t("linkSent")}
                />
            </div>
        </section>
    );
}
