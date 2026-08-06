"use client";

import { useTranslations } from "next-intl";
import { AlertOctagon } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";

export const errorsNavItems: RightNavItem[] = [
    { id: "errors-overview", label: "Overview", isActive: true },
    { id: "errors-http", label: "HTTP-level errors" },
    { id: "errors-business", label: "Business error codes" },
];

const HTTP_ERRORS = [
    { http: "400", code: "VALIDATION_ERROR", desc: "Request body is invalid or missing required fields" },
    { http: "400", code: "MALFORMED_JSON", desc: "Request body is not valid JSON" },
    { http: "400", code: "INVALID_PARAMETER", desc: "A query or path parameter has the wrong type" },
    { http: "401", code: "UNAUTHORIZED", desc: "API key missing, invalid, or revoked" },
    { http: "403", code: "ACCESS_DENIED", desc: "Authenticated, but not allowed to perform this action" },
    { http: "404", code: "ENTITY_NOT_FOUND / RESOURCE_NOT_FOUND", desc: "Referenced resource does not exist" },
    { http: "429", code: "RATE_LIMIT_EXCEEDED", desc: "Too many requests - see Retry-After header" },
    { http: "500", code: "INTERNAL_SERVER_ERROR", desc: "Unexpected server-side error" },
];

const BUSINESS_ERRORS = [
    { code: "PROVIDER_NOT_SUPPORTED", http: "400", desc: "paymentMethod does not match any configured provider" },
    { code: "AMOUNT_BELOW_MINIMUM / AMOUNT_ABOVE_MAXIMUM", http: "400", desc: "Amount is outside the provider's configured bounds" },
    { code: "CURRENCY_MISMATCH", http: "400", desc: "Currency does not match the provider's configured currency" },
    { code: "DUPLICATE_REQUEST", http: "409", desc: "Same idempotencyKey already processed for this application" },
    { code: "INSUFFICIENT_BALANCE", http: "409", desc: "Not enough available balance to complete a payout" },
    { code: "SESSION_NOT_FOUND / SESSION_EXPIRED", http: "404 / 410", desc: "Checkout session does not exist or has expired (30 min TTL)" },
    { code: "MTN_GATEWAY_ERROR / ORANGE_GATEWAY_ERROR", http: "502", desc: "The upstream Mobile Money operator failed to process the request" },
];

export function DevelopersErrors() {
    const t = useTranslations("Developers.Errors");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="errors-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <AlertOctagon className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="errors-http" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("httpTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("httpDesc")}</p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">HTTP</th>
                                    <th className="px-6 py-3 font-semibold">Code</th>
                                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {HTTP_ERRORS.map((e, i) => (
                                    <tr key={e.code} className={i < HTTP_ERRORS.length - 1 ? "border-b border-border hover:bg-muted/30 transition-colors" : "hover:bg-muted/30 transition-colors"}>
                                        <td className="px-6 py-4 font-mono font-bold text-red-500 dark:text-red-400">{e.http}</td>
                                        <td className="px-6 py-4 font-mono text-foreground whitespace-nowrap">{e.code}</td>
                                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{e.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="errors-business" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("businessTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("businessDesc")}</p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Code</th>
                                    <th className="px-6 py-3 font-semibold">HTTP</th>
                                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BUSINESS_ERRORS.map((e, i) => (
                                    <tr key={e.code} className={i < BUSINESS_ERRORS.length - 1 ? "border-b border-border hover:bg-muted/30 transition-colors" : "hover:bg-muted/30 transition-colors"}>
                                        <td className="px-6 py-4 font-mono text-foreground whitespace-nowrap">{e.code}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-amber-600 dark:text-amber-400">{e.http}</td>
                                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{e.desc}</td>
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
