"use client";

import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock, EndpointHeader, FieldTable, Callout } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const payoutNavItems: RightNavItem[] = [
    { id: "payout-overview", label: "Overview", isActive: true },
    { id: "payout-transfer", label: "Create a transfer" },
    { id: "payout-balance", label: "Balance behavior" },
];

export function DevelopersPayout() {
    const t = useTranslations("Developers.Payout");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="payout-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <Send className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="payout-transfer" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("transferTitle")}</h2>
                    <EndpointHeader
                        method="POST"
                        path="/api/v1/pay-out/transfer"
                        description={t("transferDesc")}
                        authTag="API key"
                    />
                    <FieldTable title="Request body" fields={[
                        { name: "amount", type: "integer", required: true, description: "Amount to send", example: "10000" },
                        { name: "currency", type: "string", required: true, description: "ISO 4217 currency code", example: "XAF" },
                        { name: "paymentMethod", type: "string", required: true, description: "Mobile Money provider code", example: "MTN_MOMO_CM" },
                        { name: "beneficiaryAccount", type: "string", required: true, description: "Beneficiary's phone number", example: "237690000000" },
                        { name: "beneficiaryName", type: "string", required: true, description: "Beneficiary's full name", example: "Marie Martin" },
                        { name: "merchantReference", type: "string", description: "Your internal reference" },
                        { name: "description", type: "string", description: "Transfer description" },
                        { name: "beneficiaryEmail", type: "string", description: "Beneficiary's email" },
                    ]} />
                    <FieldTable title="Response (data)" fields={[
                        { name: "reference", type: "string", description: "Unique payout reference", example: "PO-A1B2C3D4E5F6" },
                        { name: "status", type: '"PENDING"', description: "Initial status" },
                        { name: "amount", type: "integer", description: "Amount" },
                        { name: "currency", type: "string", description: "Currency" },
                        { name: "paymentMethod", type: "string", description: "Provider used" },
                        { name: "beneficiaryAccount", type: "string", description: "Beneficiary account" },
                    ]} />
                    <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-out/transfer \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_your_key" \\
  -d '{
    "amount": 10000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "beneficiaryAccount": "237690000000",
    "beneficiaryName": "Marie Martin",
    "description": "Refund for order #001"
  }'`} />
                </section>

                <section id="payout-balance" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("balanceTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("balanceDesc")}</p>
                    <Callout tone="danger" title="Insufficient balance">
                        Creating a transfer atomically moves the amount from your <code className="font-mono text-xs">available</code>{" "}
                        balance into <code className="font-mono text-xs">pending</code>. If your available balance can&apos;t
                        cover the amount, the API returns <code className="font-mono text-xs">409 INSUFFICIENT_BALANCE</code> and
                        no transaction is created. If the transfer later fails at the operator, the amount is released back
                        to <code className="font-mono text-xs">available</code>.
                    </Callout>
                </section>
            </div>
        </div>
    );
}
