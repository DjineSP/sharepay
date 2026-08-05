"use client";

import { useTranslations } from "next-intl";
import { FileCode2 } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const sdkJsNavItems: RightNavItem[] = [
    { id: "sdk-js-overview", label: "Overview", isActive: true },
    { id: "sdk-js-client", label: "Minimal client" },
];

export function DevelopersSdkJs() {
    const t = useTranslations("Developers.SdkJs");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="sdk-js-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <FileCode2 className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}{" "}
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">npm install axios</code>.
            </p>

            <section id="sdk-js-client" className="scroll-m-24">
                <h2 className="text-2xl font-bold mb-4">{t("clientTitle")}</h2>
                <CodeBlock lang="javascript" title="sharepay.js" code={`const axios = require('axios');

const client = axios.create({
  baseURL: '${BASE_URL}',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.SHAREPAY_API_KEY,
  },
});

// Pay-In: Checkout
async function createCheckout({ amount, currency, description, successUrl, cancelUrl, merchantReference }) {
  const { data } = await client.post('/pay-in/checkout', {
    amount, currency, description, successUrl, cancelUrl, merchantReference,
  });
  return data.data; // { reference, status, paymentUrl }
}

// Pay-In: Direct charge
async function createCharge({ amount, currency, paymentMethod, payerAccount, payerName, idempotencyKey }) {
  const { data } = await client.post('/pay-in/charge', {
    amount, currency, paymentMethod, payerAccount, payerName, idempotencyKey,
  });
  return data.data; // { reference, status }
}

// Pay-In: Status
async function getPayInStatus(reference) {
  const { data } = await client.get(\`/pay-in/check_status/\${reference}\`);
  return data.data;
}

// Pay-Out: Transfer
async function createTransfer({ amount, currency, paymentMethod, beneficiaryAccount, beneficiaryName }) {
  const { data } = await client.post('/pay-out/transfer', {
    amount, currency, paymentMethod, beneficiaryAccount, beneficiaryName,
  });
  return data.data;
}

(async () => {
  const session = await createCheckout({
    amount: 5000,
    currency: 'XAF',
    description: 'Order #001',
    successUrl: 'https://your-site.cm/success',
    cancelUrl: 'https://your-site.cm/cancel',
  });
  console.log('Payment link:', session.paymentUrl);
})();`} />
            </section>
        </div>
    );
}
