"use client";

import { useTranslations } from "next-intl";
import { Radio } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock } from "../../doc-widgets";

export const webhooksEventsNavItems: RightNavItem[] = [
    { id: "webhooks-events-overview", label: "Overview", isActive: true },
    { id: "webhooks-events-list", label: "Event types" },
    { id: "webhooks-events-payload", label: "Payload shape" },
];

const EVENTS = [
    { event: "payment.created", desc: "An incoming checkout session was created" },
    { event: "payment.success", desc: "An incoming payment was confirmed by the provider" },
    { event: "payment.failed", desc: "An incoming payment failed or was rejected" },
    { event: "payment.cancelled", desc: "The customer cancelled the checkout session" },
    { event: "payment.expired", desc: "The checkout session expired (30 min) without being completed" },
    { event: "payout.created", desc: "A transfer to a beneficiary was initiated" },
    { event: "payout.success", desc: "A transfer to a beneficiary succeeded" },
    { event: "payout.failed", desc: "A transfer failed" },
    { event: "payout.cancelled", desc: "A transfer was cancelled" },
    { event: "collection.expired", desc: "A fund collection page reached its expiry date" },
    { event: "webhook.test", desc: "Test event sent from the dashboard" },
];

export function DevelopersWebhooksEvents() {
    const t = useTranslations("Developers.WebhooksEvents");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="webhooks-events-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <Radio className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="webhooks-events-list" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("listTitle")}</h2>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Event</th>
                                    <th className="px-6 py-3 font-semibold hidden sm:table-cell">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {EVENTS.map((e, i) => (
                                    <tr key={e.event} className={i < EVENTS.length - 1 ? "border-b border-border hover:bg-muted/30 transition-colors" : "hover:bg-muted/30 transition-colors"}>
                                        <td className="px-6 py-4 font-mono font-semibold text-foreground whitespace-nowrap">{e.event}</td>
                                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{e.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="webhooks-events-payload" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("payloadTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("payloadDesc")}</p>
                    <CodeBlock lang="json" code={`{
  "event": "payment.success",
  "timestamp": "2026-08-04T12:05:00.000Z",
  "applicationId": "app_1a2b3c",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "SUCCESS",
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000"
  }
}`} />
                </section>
            </div>
        </div>
    );
}
