"use client";

import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock, EndpointHeader, FieldTable, Callout } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const initiateNavItems: RightNavItem[] = [
    { id: "initiate-overview", label: "Overview", isActive: true },
    { id: "initiate-checkout", label: "Checkout (hosted page)" },
    { id: "initiate-charge", label: "Charge (direct debit)" },
];

export function DevelopersInitiate() {
    const t = useTranslations("Developers.Initiate");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="initiate-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <Zap className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="initiate-checkout" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("checkoutTitle")}</h2>
                    <EndpointHeader
                        method="POST"
                        path="/api/v1/pay-in/checkout"
                        description={t("checkoutDesc")}
                        authTag="API key"
                    />
                    <FieldTable title="Request body" fields={[
                        { name: "amount", type: "integer", required: true, description: "Amount in the currency's base unit", example: "5000" },
                        { name: "currency", type: "string", required: true, description: "ISO 4217 currency code", example: "XAF" },
                        { name: "merchantReference", type: "string", description: "Your internal reference (free-form)", example: "ORDER-2026-001" },
                        { name: "description", type: "string", description: "Shown on the hosted payment page" },
                        { name: "successUrl", type: "string (URL)", description: "Redirect target after a successful payment" },
                        { name: "cancelUrl", type: "string (URL)", description: "Redirect target after cancellation" },
                    ]} />
                    <FieldTable title="Response (data)" fields={[
                        { name: "reference", type: "string", description: "Unique transaction reference", example: "PI-A1B2C3D4E5F6" },
                        { name: "status", type: '"PENDING"', description: "Initial status of the session" },
                        { name: "amount", type: "integer", description: "Confirmed amount" },
                        { name: "currency", type: "string", description: "Currency" },
                        { name: "paymentUrl", type: "string (URL)", description: "URL to redirect the customer to" },
                    ]} />
                    <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-in/checkout \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_your_key" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "merchantReference": "ORDER-2026-001",
    "description": "Order #001 payment",
    "successUrl": "https://your-site.cm/success",
    "cancelUrl": "https://your-site.cm/cancel"
  }'`} />
                    <Callout tone="info" title="Session lifetime">
                        A checkout session stays valid for 30 minutes. After that it is automatically expired and the
                        payment link stops working - create a new session if the customer needs to retry.
                    </Callout>
                </section>

                <section id="initiate-charge" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("chargeTitle")}</h2>
                    <EndpointHeader
                        method="POST"
                        path="/api/v1/pay-in/charge"
                        description={t("chargeDesc")}
                        authTag="API key"
                    />
                    <FieldTable title="Request body" fields={[
                        { name: "amount", type: "integer", required: true, description: "Amount in the currency's base unit", example: "5000" },
                        { name: "currency", type: "string", required: true, description: "ISO 4217 currency code", example: "XAF" },
                        { name: "paymentMethod", type: "string", required: true, description: "Mobile Money provider code", example: "MTN_MOMO_CM" },
                        { name: "payerAccount", type: "string", required: true, description: "Payer's phone number", example: "237690000000" },
                        { name: "merchantReference", type: "string", description: "Your internal reference" },
                        { name: "description", type: "string", description: "Transaction description" },
                        { name: "payerName", type: "string", description: "Payer's name" },
                        { name: "payerEmail", type: "string", description: "Payer's email" },
                        { name: "idempotencyKey", type: "string", description: "Idempotency key, unique per application - retry-safe", example: "idem-001-v1" },
                    ]} />
                    <FieldTable title="Response (data)" fields={[
                        { name: "reference", type: "string", description: "Unique transaction reference", example: "PI-A1B2C3D4E5F6" },
                        { name: "status", type: '"PENDING"', description: "Initial status - processing has started" },
                        { name: "amount", type: "integer", description: "Amount" },
                        { name: "currency", type: "string", description: "Currency" },
                        { name: "paymentMethod", type: "string", description: "Provider used" },
                        { name: "payerAccount", type: "string", description: "Payer's account" },
                    ]} />
                    <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/pay-in/charge \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_your_key" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "paymentMethod": "MTN_MOMO_CM",
    "payerAccount": "237690000000",
    "payerName": "Jean Dupont",
    "idempotencyKey": "idem-order-001-v1"
  }'`} />
                    <Callout tone="warning" title="Idempotency">
                        Always send a unique <code className="font-mono text-xs">idempotencyKey</code> per logical charge attempt.
                        Replaying the same key on retry returns the original transaction instead of creating a duplicate
                        charge (<code className="font-mono text-xs">409 DUPLICATE_REQUEST</code> if it&apos;s still processing).
                    </Callout>
                </section>
            </div>
        </div>
    );
}
