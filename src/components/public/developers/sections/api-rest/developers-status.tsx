"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock, EndpointHeader, FieldTable, StatusPill } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const statusNavItems: RightNavItem[] = [
    { id: "status-overview", label: "Overview", isActive: true },
    { id: "status-payin", label: "Pay-In status" },
    { id: "status-payout", label: "Pay-Out status" },
    { id: "status-values", label: "Status values" },
];

export function DevelopersStatus() {
    const t = useTranslations("Developers.Status");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="status-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <Search className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="status-payin" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("payinTitle")}</h2>
                    <EndpointHeader
                        method="GET"
                        path="/api/v1/pay-in/check_status/{reference}"
                        description={t("payinDesc")}
                        authTag="API key"
                    />
                    <FieldTable title="Path parameter" fields={[
                        { name: "reference", type: "string", required: true, description: "Transaction reference", example: "PI-A1B2C3D4E5F6" },
                    ]} />
                    <CodeBlock lang="bash" code={`curl ${BASE_URL}/pay-in/check_status/PI-A1B2C3D4E5F6 \\
  -H "X-API-KEY: sk_live_your_key"`} />
                    <CodeBlock lang="json" code={`{
  "success": true,
  "code": "OK",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "type": "CHARGE",
    "status": "SUCCESS",
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000"
  },
  "timestamp": "2026-08-04T12:05:00.000Z"
}`} />
                </section>

                <section id="status-payout" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("payoutTitle")}</h2>
                    <EndpointHeader
                        method="GET"
                        path="/api/v1/pay-out/check_status/{reference}"
                        description={t("payoutDesc")}
                        authTag="API key"
                    />
                    <FieldTable title="Path parameter" fields={[
                        { name: "reference", type: "string", required: true, description: "Payout reference", example: "PO-A1B2C3D4E5F6" },
                    ]} />
                    <CodeBlock lang="bash" code={`curl ${BASE_URL}/pay-out/check_status/PO-A1B2C3D4E5F6 \\
  -H "X-API-KEY: sk_live_your_key"`} />
                </section>

                <section id="status-values" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("valuesTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("valuesDesc")}</p>
                    <div className="flex flex-wrap gap-2">
                        {["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"].map((s) => (
                            <StatusPill key={s} status={s} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
