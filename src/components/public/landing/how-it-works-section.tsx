"use client";

import { useTranslations } from "next-intl";
import { UserPlus, Code2, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorksSection() {
    const t = useTranslations('Landing.HowItWorks');

    const steps = [
        {
            number: 1,
            icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
            title: t('step1.title'),
            description: t('step1.description'),
        },
        {
            number: 2,
            icon: <Code2 className="h-5 w-5 text-emerald-500" />,
            title: t('step2.title'),
            description: t('step2.description'),
        },
        {
            number: 3,
            icon: <Rocket className="h-5 w-5 text-emerald-500" />,
            title: t('step3.title'),
            description: t('step3.description'),
        },
    ];

    return (
        <section className="py-20 md:py-28 relative overflow-hidden bg-background">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

            <div className="container mx-auto relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
                    <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-5">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Steps grid */}
                <div className="relative">
                    {/* Connecting line - desktop only */}
                    <div className="absolute top-7 left-[calc(16.67%+1.75rem)] right-[calc(16.67%+1.75rem)] h-px bg-gradient-to-r from-emerald-500/50 via-emerald-500/20 to-emerald-500/50 hidden md:block" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="flex flex-col items-center text-center"
                            >
                                {/* Numbered circle */}
                                <div className="relative z-10 w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-black mb-6 shadow-lg shadow-emerald-500/30">
                                    {step.number}
                                </div>

                                {/* Step card */}
                                <div className="w-full bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all duration-200">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2.5 text-foreground">{step.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
