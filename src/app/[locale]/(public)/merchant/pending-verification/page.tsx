"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { tokenStorage, StoredUserInfo } from "@/lib/token-storage";
import { LoaderPage } from "@/components/shared/loader-page";
import {
    Clock,
    Mail,
    FileText,
    Hourglass,
    ShieldCheck,
    Briefcase,
    ArrowRight,
    MessageCircle,
} from "lucide-react";

export default function PendingVerificationPage() {
    const t = useTranslations("Auth.PendingVerification");
    const router = useRouter();
    const [user, setUser] = useState<StoredUserInfo | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const info = tokenStorage.getUser();
        if (!info) { router.replace("/merchant/login"); return; }
        if (info.status === "ACTIVE") { router.replace("/merchant/dashboard"); return; }
        setUser(info);
        setChecked(true);
    }, [router]);

    const getInitials = (name: string) =>
        name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "U";

    const formatValue = (value: string) =>
        value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    if (!checked) return <LoaderPage />;

    const steps = [
        {
            icon: Mail,
            title: t("step1"),
            color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        },
        {
            icon: FileText,
            title: t("step2"),
            color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
        },
        {
            icon: Clock,
            title: t("step3"),
            color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        },
    ];

    return (
        <div className="min-h-screen pt-28 pb-20 px-4">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* ── Hero ─────────────────────────────────── */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 ring-8 ring-amber-50 dark:ring-amber-900/10">
                        <Hourglass className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {t("title")}
                            </h1>
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                                {t("statusLabel")}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm">
                            {t("description")}
                        </p>
                    </div>
                </div>

                {/* ── User info ────────────────────────────── */}
                <div className="rounded-2xl border bg-card overflow-hidden">
                    {/* Avatar band */}
                    <div className="px-6 pt-6 pb-10 text-center relative">
                        <Avatar className="h-16 w-16 mx-auto border-4 border-background shadow-md">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {getInitials(user!.fullName)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Details - pulled up over the band */}
                    <div className="-mt-6 mx-4 mb-4 rounded-xl bg-card border shadow-sm px-5 py-4 space-y-4">
                        <div className="text-center">
                            <p className="font-bold text-lg leading-tight">{user!.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user!.email}</p>
                        </div>

                        <div className="h-px bg-border" />

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                                <span className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center shrink-0">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">Rôle</p>
                                    <p className="text-sm font-semibold">{formatValue(user!.role)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                                <span className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">KYC</p>
                                    <p className="text-sm font-semibold">{formatValue(user!.kycLevel)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Steps ────────────────────────────────── */}
                <div className="rounded-2xl border bg-card p-5 space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("whatNextTitle")}
                    </p>
                    <ol className="relative space-y-0">
                        {steps.map(({ icon: Icon, title, color }, i) => (
                            <li key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                                {/* Connecting line */}
                                {i < steps.length - 1 && (
                                    <span className="absolute left-[17px] top-9 bottom-0 w-px bg-border" />
                                )}
                                <span className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 ${color}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="pt-1.5">
                                    <p className="text-sm font-medium">{title}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* ── Contact ──────────────────────────────── */}
                <div className="rounded-2xl border bg-card p-5">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold">{t("contactTitle")}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{t("contactDescription")}</p>
                        </div>
                    </div>
                    <Button className="w-full mt-4 gap-2" asChild>
                        <Link href="/contact">
                            {t("contactBtn")}
                            <ArrowRight className="h-4 w-4 ml-auto" />
                        </Link>
                    </Button>
                </div>

            </div>
        </div>
    );
}
