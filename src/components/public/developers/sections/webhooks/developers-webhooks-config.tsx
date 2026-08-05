"use client";

import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock, EndpointHeader, Callout } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const webhooksConfigNavItems: RightNavItem[] = [
    { id: "webhooks-config-overview", label: "Overview", isActive: true },
    { id: "webhooks-config-endpoints", label: "Configuration endpoints" },
    { id: "webhooks-config-signature", label: "Verifying signatures" },
    { id: "webhooks-config-retries", label: "Delivery & retries" },
];

export function DevelopersWebhooksConfig() {
    const t = useTranslations("Developers.WebhooksConfig");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="webhooks-config-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <Settings className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="webhooks-config-endpoints" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("endpointsTitle")}</h2>
                    <div className="space-y-4">
                        <EndpointHeader method="GET" path="/api/v1/webhook" description={t("getDesc")} authTag="API key" />
                        <EndpointHeader method="PATCH" path="/api/v1/webhook" description={t("patchDesc")} authTag="API key" />
                        <EndpointHeader method="POST" path="/api/v1/webhook/test" description={t("testDesc")} authTag="API key" />
                    </div>
                    <CodeBlock lang="bash" code={`curl -X PATCH ${BASE_URL}/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_live_your_key" \\
  -d '{ "webhookUrl": "https://your-site.cm/webhooks/sharepay" }'`} />
                </section>

                <section id="webhooks-config-signature" className="scroll-m-24 space-y-6">
                    <h2 className="text-2xl font-bold mb-2">{t("signatureTitle")}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t("signatureDesc")}{" "}
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">t=&lt;epoch&gt;,v1=&lt;hmac-hex&gt;</code>.
                    </p>
                    <CodeBlock lang="javascript" code={`// Node.js / Express
const crypto = require('crypto');

function verifySignature(rawBody, signatureHeader, secret) {
  // signatureHeader looks like: "t=1735900000,v1=9f8c3a..."
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => p.split('='))
  );
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(parts.v1, 'hex'), Buffer.from(digest, 'hex'));
}

app.post('/webhooks/sharepay', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-sharepay-signature'];
  if (!sig || !verifySignature(req.body, sig, process.env.SHAREPAY_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const { event, data } = JSON.parse(req.body);
  // handle event...
  res.status(200).send('OK');
});`} />
                    <Callout tone="warning" title="Keep your secret safe">
                        Your webhook secret is generated once and shown only at creation/rotation time - store it in an
                        environment variable, never in your codebase. Rotating it (<code className="font-mono text-xs">POST /rotate</code>)
                        invalidates the previous secret immediately.
                    </Callout>
                </section>

                <section id="webhooks-config-retries" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("retriesTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("retriesDesc")}</p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Attempt</th>
                                    <th className="px-6 py-3 font-semibold">Next retry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { a: "1", n: "+1 min" },
                                    { a: "2", n: "+5 min" },
                                    { a: "3", n: "+30 min" },
                                    { a: "4", n: "+2 h" },
                                    { a: "5 (final)", n: "abandoned - status stays FAILED" },
                                ].map((r, i, arr) => (
                                    <tr key={r.a} className={i < arr.length - 1 ? "border-b border-border hover:bg-muted/30 transition-colors" : "hover:bg-muted/30 transition-colors"}>
                                        <td className="px-6 py-4 font-mono text-foreground">{r.a}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{r.n}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
