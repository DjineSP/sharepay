"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Webhook, Code2, FlaskConical, Lock, Play, Check, Sparkles } from "lucide-react";

const CODE_LINES = [
    { code: "const pay = SharePay('pk_test_123');", tokens: [
        { text: "const ", cls: "text-purple-400" },
        { text: "pay ", cls: "text-blue-300" },
        { text: "= ", cls: "text-slate-300" },
        { text: "SharePay", cls: "text-yellow-300" },
        { text: "('", cls: "text-slate-300" },
        { text: "pk_test_123", cls: "text-amber-300" },
        { text: "');", cls: "text-slate-300" },
    ]},
    { code: "", tokens: [] },
    { code: "// Initialize transaction", tokens: [
        { text: "// Initialize transaction", cls: "text-slate-500 italic" },
    ]},
    { code: "await pay.init({", tokens: [
        { text: "await ", cls: "text-purple-400" },
        { text: "pay", cls: "text-blue-300" },
        { text: ".init({", cls: "text-slate-300" },
    ]},
    { code: "  amount: 25000,", tokens: [
        { text: "  amount", cls: "text-sky-300" },
        { text: ": ", cls: "text-slate-300" },
        { text: "25000", cls: "text-orange-400" },
        { text: ",", cls: "text-slate-300" },
    ]},
    { code: "  currency: 'XAF',", tokens: [
        { text: "  currency", cls: "text-sky-300" },
        { text: ": '", cls: "text-slate-300" },
        { text: "XAF", cls: "text-amber-300" },
        { text: "',", cls: "text-slate-300" },
    ]},
    { code: "  methods: ['mtn', 'orange', 'card'],", tokens: [
        { text: "  methods", cls: "text-sky-300" },
        { text: ": [", cls: "text-slate-300" },
        { text: "'mtn'", cls: "text-amber-300" },
        { text: ", ", cls: "text-slate-300" },
        { text: "'orange'", cls: "text-amber-300" },
        { text: ", ", cls: "text-slate-300" },
        { text: "'card'", cls: "text-amber-300" },
        { text: "],", cls: "text-slate-300" },
    ]},
    { code: "  callback: (res) => {", tokens: [
        { text: "  callback", cls: "text-sky-300" },
        { text: ": (", cls: "text-slate-300" },
        { text: "res", cls: "text-blue-300" },
        { text: ") => {", cls: "text-slate-300" },
    ]},
    { code: "    if (res.status === 'success') {", tokens: [
        { text: "    ", cls: "" },
        { text: "if ", cls: "text-purple-400" },
        { text: "(res.status === ", cls: "text-slate-300" },
        { text: "'success'", cls: "text-amber-300" },
        { text: ") {", cls: "text-slate-300" },
    ]},
    { code: "      console.log('Success!');", tokens: [
        { text: "      console", cls: "text-blue-300" },
        { text: ".log(", cls: "text-slate-300" },
        { text: "'Success!'", cls: "text-amber-300" },
        { text: ");", cls: "text-slate-300" },
    ]},
    { code: "    }", tokens: [{ text: "    }", cls: "text-slate-300" }] },
    { code: "  }", tokens: [{ text: "  }", cls: "text-slate-300" }] },
    { code: "});", tokens: [{ text: "});", cls: "text-slate-300" }] },
];

const SUCCESS_RESPONSE = `{
  "transaction_id": "txn_abc123",
  "status": "initiated",
  "amount": 25000,
  "currency": "XAF",
  "checkout_url": "https://pay.sharepay.co/c/abc123"
}`;

export function IntegrationSection() {
    const t = useTranslations('Landing.Integration');
    const [isRunning, setIsRunning] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    const features = [
        { icon: <Webhook className="h-4 w-4 text-emerald-400" />, title: t('feat1Title'), desc: t('feat1Desc') },
        { icon: <Code2 className="h-4 w-4 text-emerald-400" />, title: t('feat2Title'), desc: t('feat2Desc') },
        { icon: <FlaskConical className="h-4 w-4 text-emerald-400" />, title: t('feat3Title'), desc: t('feat3Desc') },
        { icon: <Lock className="h-4 w-4 text-emerald-400" />, title: t('feat4Title'), desc: t('feat4Desc') },
    ];

    const runRequest = () => {
        setIsRunning(true);
        setResponse(null);
        setTimeout(() => {
            setIsRunning(false);
            setResponse(SUCCESS_RESPONSE);
        }, 1400);
    };

    return (
        <section className="py-20 md:py-28 overflow-hidden relative bg-slate-900">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

                    {/* Left - title, subtitle, 2×2 features */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                            {t('title')}
                        </h2>
                        <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-10">
                            {t('subtitle')}
                        </p>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        {f.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{f.title}</p>
                                        <p className="text-slate-400 text-sm mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - code editor */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-primary/20 rounded-2xl blur-xl opacity-50" />

                        <div className="relative bg-[#0d1117] rounded-2xl shadow-2xl overflow-hidden border border-white/8">

                            {/* Editor chrome */}
                            <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.06]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                </div>
                                <span className="text-xs text-slate-500 font-mono">checkout.js</span>
                                <div className="w-16" />
                            </div>

                            {/* Code */}
                            <div className="p-5 font-mono text-[13px] leading-6 overflow-x-auto">
                                {CODE_LINES.map((line, i) => (
                                    <div key={i} className="flex">
                                        <span className="text-slate-600 select-none w-7 shrink-0 text-right mr-4 text-[11px] leading-6">
                                            {i + 1}
                                        </span>
                                        <span>
                                            {line.tokens.length > 0
                                                ? line.tokens.map((token, j) => (
                                                    <span key={j} className={token.cls}>{token.text}</span>
                                                ))
                                                : <span>&nbsp;</span>
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Run bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-t border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">
                                        {t('liveEnv')}
                                    </span>
                                </div>

                                <button
                                    onClick={runRequest}
                                    disabled={isRunning}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                                        response
                                            ? 'bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                                            : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 active:scale-95'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('sending')}
                                        </>
                                    ) : response ? (
                                        <>
                                            <Check className="h-3 w-3" />
                                            200 OK
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3 fill-current" />
                                            {t('runBtn')}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Response panel */}
                            {response && (
                                <div className="border-t border-white/[0.06] bg-[#080d12]">
                                    <div className="px-5 pt-3 pb-1 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                            {t('serverResp')}
                                        </span>
                                    </div>
                                    <pre className="px-5 pb-4 font-mono text-[12px] text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
                                        {response}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
