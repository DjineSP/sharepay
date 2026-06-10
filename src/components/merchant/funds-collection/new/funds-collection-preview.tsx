"use client";

import { useState } from "react";
import { Eye, Smartphone, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";

const COLOR = "#098865";

interface PaymentPreviewProps {
    data: {
        title: string;
        description: string;
        amountValue: number;
        currency: string;
        amountType: "fixed" | "free";
        coverImageUrl: string | undefined;
        collectCustomerInfo: boolean;
    };
}

export function FundsCollectionPreview({ data }: PaymentPreviewProps) {
    const t = useTranslations('Dashboard.FundsCollection.New');
    const [viewMode, setViewMode] = useState<"mobile" | "web">("web");
    const isMobile = viewMode === "mobile";

    const slug = data.title?.toLowerCase().replace(/\s+/g, '-') || 'collecte';

    return (
        <div className="sticky top-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Eye className="w-4 h-4" /> {t("previewTitle")}
                </div>
                <div className="flex items-center bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("mobile")}
                        className={`p-1.5 rounded-md transition-all ${isMobile ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        title={t("viewMobile")}
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("web")}
                        className={`p-1.5 rounded-md transition-all ${!isMobile ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        title={t("viewWeb")}
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Frame */}
            <div className={isMobile
                ? "relative mx-auto bg-[#f8fafc] overflow-hidden border-[8px] border-slate-900 rounded-[2.5rem] h-[640px] w-[300px] shadow-2xl"
                : "relative bg-[#f8fafc] overflow-hidden border border-border rounded-xl shadow-xl"
            }>
                {/* Notch / Browser bar */}
                {isMobile ? (
                    <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-xl w-32 mx-auto z-10" />
                ) : (
                    <div className="absolute top-0 inset-x-0 h-9 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2 z-10">
                        <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-3 flex-1 h-5 bg-white rounded border border-slate-200 flex items-center px-2 text-[9px] text-slate-400 font-mono truncate">
                            sharepay.app/collect/{slug}
                        </div>
                    </div>
                )}

                {/* Scrollable content */}
                <div
                    className={`h-full overflow-y-auto ${isMobile ? 'scrollbar-none [&::-webkit-scrollbar]:hidden' : ''}`}
                    style={{ paddingTop: isMobile ? '2.5rem' : '2.75rem' }}
                >
                    <div className={`space-y-4 ${isMobile ? 'px-3 py-4' : 'px-6 py-5 max-h-[560px]'}`}>

                        {/* ── Header : logo SharePay + titre + description ── */}
                        <div className="flex flex-col items-center text-center space-y-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/logo_sharepay_bg_remove_svg.svg"
                                alt="SharePay"
                                className="h-7 w-auto object-contain"
                            />
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">
                                {data.title || t("previewDefaultTitle")}
                            </h2>
                            {data.description && (
                                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 max-w-xs">
                                    {data.description}
                                </p>
                            )}
                        </div>

                        {/* ── Formulaire : 2 colonnes web, 1 colonne mobile ── */}
                        <div className={`grid gap-3 ${!isMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>

                            {/* Colonne gauche : infos collecte */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                                {/* Image de couverture */}
                                {data.coverImageUrl ? (
                                    <div className="relative h-24 overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={data.coverImageUrl}
                                            alt={data.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    </div>
                                ) : (
                                    /* Bannière décorative */
                                    <div
                                        className="h-14 flex items-center justify-center shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${COLOR}1a, ${COLOR}0d, transparent)` }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                                            fill="none" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                            className="opacity-40">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="p-3 space-y-3 flex flex-col flex-1">
                                    {/* Montant fixe */}
                                    {data.amountType === "fixed" ? (
                                        <div
                                            className="rounded-lg p-3 border text-center mt-auto"
                                            style={{ background: `${COLOR}0d`, borderColor: `${COLOR}1a` }}
                                        >
                                            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block mb-0.5">
                                                Montant à payer
                                            </span>
                                            <span className="text-base font-black" style={{ color: COLOR }}>
                                                {data.amountValue > 0
                                                    ? data.amountValue.toLocaleString('fr-FR')
                                                    : '-'
                                                }{' '}
                                                <span className="text-xs">{data.currency}</span>
                                            </span>
                                        </div>
                                    ) : (
                                        /* Montant libre */
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-semibold text-slate-700 block">
                                                Montant de votre contribution
                                                <span className="ml-1" style={{ color: COLOR }}>({data.currency})</span>
                                            </label>
                                            <div className="relative h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 flex items-center justify-between">
                                                <span className="text-[10px] text-slate-400">Ex: 5 000</span>
                                                <span className="text-[9px] font-bold text-slate-400">{data.currency}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Infos client */}
                                    {data.collectCustomerInfo && (
                                        <div className="space-y-2 mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-px flex-1 bg-slate-200" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 px-1">
                                                    Vos informations
                                                </span>
                                                <div className="h-px flex-1 bg-slate-200" />
                                            </div>
                                            <div className="h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 flex items-center">
                                                <span className="text-[10px] text-slate-400">Nom complet</span>
                                            </div>
                                            <div className="h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 flex items-center">
                                                <span className="text-[10px] text-slate-400">Adresse e-mail</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colonne droite : paiement */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-3 flex flex-col">
                                <h3 className="text-[11px] font-bold text-slate-800">Payer avec</h3>

                                {/* Providers */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div
                                        className="border-2 rounded-lg p-2 flex flex-col items-center gap-1.5"
                                        style={{ borderColor: COLOR, background: `${COLOR}08` }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/images/partners/logo_momo.png" alt="MTN MoMo"
                                            className="h-8 w-8 object-contain" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-center text-slate-700">
                                            MTN MoMo
                                        </span>
                                    </div>
                                    <div className="border-2 border-slate-200 rounded-lg p-2 flex flex-col items-center gap-1.5 opacity-60">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/images/partners/logo_orange_money.png" alt="Orange Money"
                                            className="h-8 w-8 object-contain" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-center text-slate-700">
                                            Orange Money
                                        </span>
                                    </div>
                                </div>

                                {/* Numéro */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-semibold text-slate-700 block">
                                        Numéro de paiement
                                    </label>
                                    <div className="h-8 bg-slate-50 border border-slate-200 rounded-xl px-2 flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            className="text-slate-400 shrink-0">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span className="text-[9px] font-bold text-slate-500 border-r border-slate-300 pr-1.5">+237</span>
                                        <span className="text-[10px] text-slate-400">6XXXXXXXX</span>
                                    </div>
                                </div>

                                {/* Bouton submit */}
                                <button
                                    className="mt-auto w-full h-9 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1.5 shadow-sm"
                                    style={{ backgroundColor: COLOR }}
                                    disabled
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                                        fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    Contribuer maintenant
                                </button>
                            </div>
                        </div>

                        {/* Footer sécurité */}
                        <div className="flex items-center justify-center gap-1.5 py-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                fill="none" stroke={COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="opacity-60 shrink-0">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${COLOR}99` }}>
                                Transactions sécurisées par SharePay
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
