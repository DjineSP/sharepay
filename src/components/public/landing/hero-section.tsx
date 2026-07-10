"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
    ArrowRight, Play,
    TrendingUp, ShieldCheck, Zap, Lock, BadgeCheck,
} from "lucide-react";
import { HeroBackground } from "@/components/public/landing/animations/hero-background";
import { DemoModal } from "@/components/public/landing/animations/demo-modal";
import { motion } from "framer-motion";
import { usePublicStats } from "@/features/public";

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

function formatStat(n: number): string {
    if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M+`;
    if (n >= 1_000)     return `${Math.floor(n / 1_000)}k+`;
    return n > 0 ? `${n}+` : "0";
}

// Courbe lisse pré-calculée avec Catmull-Rom tension=0.1 sur 7 points
// viewBox 280×70 - axe Y inversé (0=haut, 70=bas)
const CHART_LINE = "M0,57 C4,56 37,46 47,45 C57,44 84,55 93,53 C103,51 131,38 140,36 C149,34 177,43 187,41 C197,39 224,20 233,18 C243,16 275,15 280,14";
const CHART_AREA = `${CHART_LINE} L280,70 L0,70 Z`;
const X_LABELS   = ["26 avr", "27 avr", "28 avr", "29 avr", "30 avr", "01 mai", "02 mai"];

const MOCK_TRANSACTIONS = [
    { initials: "KM", name: "DJINE SINTO PAFING",  meta: "02 mai · MTN Mobile Money", amount: "+15 000 XAF", avatarBg: "bg-amber-500/15",   avatarText: "text-amber-600"   },
    { initials: "FB", name: "MAHAMAT ALI",   meta: "01 mai · Orange Money",     amount: "+8 500 XAF",  avatarBg: "bg-orange-500/15",  avatarText: "text-orange-500"  },
    { initials: "NA", name: "AMAYEN BOUSSIOM THIERRY MARTIN",     meta: "01 mai · MTN Mobile Money", amount: "+22 000 XAF", avatarBg: "bg-emerald-500/15", avatarText: "text-emerald-600" },
];

export function HeroSection() {
    const t = useTranslations('Landing.Hero');
    const { data: stats } = usePublicStats();

    return (
        <section className="relative flex flex-col pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
            <HeroBackground />

            <div className="container mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

                    {/* Left column */}
                    <div className="flex-1 flex flex-col items-start text-left">

                        {/* Badge */}
                        <motion.div
                            {...fadeUp(0)}
                            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        >
                            <BadgeCheck className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-semibold">{t('badgeText')}</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            {...fadeUp(0.1)}
                            className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight mb-5 leading-[1.05] text-foreground whitespace-pre-line"
                        >
                            {t.rich('title', {
                                accent: (chunks) => (
                                    <span className="text-emerald-500">{chunks}</span>
                                )
                            })}
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            {...fadeUp(0.2)}
                            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg font-medium text-pretty"
                        >
                            {t('subtitle')}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            {...fadeUp(0.3)}
                            className="flex flex-col sm:flex-row gap-3 items-start mb-8 w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                asChild
                                className="rounded-full h-12 sm:h-13 px-8 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 font-bold w-full sm:w-auto group relative overflow-hidden"
                            >
                                <Link href="/merchant/register">
                                    <span className="relative z-10 flex items-center justify-center">
                                        {t('ctaStart')}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </Link>
                            </Button>

                            <DemoModal>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    suppressHydrationWarning
                                    className="rounded-full h-12 sm:h-13 px-8 text-base border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto font-semibold group cursor-pointer"
                                >
                                    <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                                    {t('ctaDemo')}
                                </Button>
                            </DemoModal>
                        </motion.div>

                        {/* Reassurance */}
                        <motion.div
                            {...fadeUp(0.4)}
                            className="flex flex-wrap items-center gap-x-5 gap-y-2"
                        >
                            {[
                                { Icon: Zap, label: t('reassurance1') },
                                { Icon: TrendingUp, label: t('reassurance2') },
                                { Icon: Lock, label: t('reassurance3') },
                                { Icon: ShieldCheck, label: t('reassurance4') },
                            ].map(({ Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    <span className="font-medium">{label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right column - glassmorphism dashboard card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" as const }}
                        className="lg:w-[420px] xl:w-[460px] shrink-0"
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/15 to-primary/15 rounded-[44px] blur-2xl pointer-events-none" />

                            <div className="relative bg-card/80 backdrop-blur-xl rounded-[28px] border border-border/60 shadow-2xl overflow-hidden p-6">

                                {/* Card header */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">{t('mockupRevenue')}</span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-emerald-500">{t('mockupLive')}</span>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div className="mb-4">
                                    <p className="text-2xl font-black text-foreground tracking-tight">240 000 XAF</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex items-center gap-1 text-emerald-500">
                                            <TrendingUp className="h-3 w-3" />
                                            <span className="text-xs font-semibold">+23.5%</span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">vs last month</span>
                                    </div>
                                </div>

                                {/* Line chart - même style que le vrai dashboard */}
                                <div className="mb-3">
                                    <svg
                                        viewBox="0 0 280 70"
                                        className="w-full h-[64px]"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Grid dashed */}
                                        <line x1="0" y1="1"  x2="280" y2="1"  stroke="currentColor" className="text-muted-foreground/20" strokeWidth="0.6" strokeDasharray="4 4" />
                                        <line x1="0" y1="35" x2="280" y2="35" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="0.6" strokeDasharray="4 4" />
                                        <line x1="0" y1="69" x2="280" y2="69" stroke="currentColor" className="text-border" strokeWidth="1" />
                                        {/* Area fill */}
                                        <path d={CHART_AREA} fill="url(#heroChartFill)" />
                                        {/* Line */}
                                        <path
                                            d={CHART_LINE}
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {/* X-axis labels */}
                                    <div className="flex justify-between mt-1 px-0.5">
                                        {X_LABELS.map((l) => (
                                            <span key={l} className="text-[8.5px] text-muted-foreground leading-none">{l}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border/50 mb-3" />

                                {/* Transactions récentes - même layout que le vrai dashboard */}
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                    {t('mockupTransactions')}
                                </p>
                                <div>
                                    {MOCK_TRANSACTIONS.map((tx) => (
                                        <div key={tx.name} className="flex items-center gap-2.5 py-2.5 border-b last:border-b-0 border-border/40">
                                            {/* Avatar */}
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black ${tx.avatarBg} ${tx.avatarText}`}>
                                                {tx.initials}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">{tx.name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{tx.meta}</p>
                                            </div>
                                            {/* Montant + statut */}
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-bold text-emerald-500">{tx.amount}</p>
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600">Succès</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" as const }}
                    className="mt-14 md:mt-20 pt-8 border-t border-border/40 grid grid-cols-3 gap-6"
                >
                    {[
                        { value: stats ? formatStat(stats.merchantCount)      : "-", label: t('statMerchantsLabel') },
                        { value: stats ? formatStat(stats.transactionCount)   : "-", label: t('statTxLabel') },
                        { value: stats ? formatStat(stats.paymentMethodCount) : "-", label: t('statMethodsLabel') },
                    ].map(({ value, label }, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-none">
                                {value}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground font-medium mt-2">
                                {label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
