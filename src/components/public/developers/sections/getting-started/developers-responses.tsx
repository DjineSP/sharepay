"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock, FieldTable } from "../../doc-widgets";

// ── Overview ──────────────────────────────────────────────────────────────────

export const responsesNavItems: RightNavItem[] = [
    { id: "responses-overview", label: "Overview", isActive: true },
    { id: "responses-envelope", label: "The envelope" },
    { id: "responses-pagination", label: "Paginated lists" },
];

export function DevelopersResponses() {
    const t = useTranslations("Developers.Responses");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="responses-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24">
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="responses-envelope" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("envelopeTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("envelopeDesc")}</p>
                    <FieldTable title="ApiResponse<T>" fields={[
                        { name: "success", type: "boolean", description: "true if the request executed without error" },
                        { name: "code", type: "string", description: "Machine-readable business code", example: "CHECKOUT_CREATED" },
                        { name: "message", type: "string", description: "Human-readable message" },
                        { name: "data", type: "T | null", description: "Response payload (null on error)" },
                        { name: "timestamp", type: "ISO 8601", description: "Response timestamp" },
                    ]} />
                    <div className="mt-4">
                        <CodeBlock lang="json" code={`{
  "success": true,
  "code": "CHECKOUT_CREATED",
  "message": "Payment session created.",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "PENDING",
    "amount": 5000,
    "currency": "XAF"
  },
  "timestamp": "2026-08-04T12:00:00.000Z"
}`} />
                    </div>
                </section>

                <section id="responses-pagination" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("paginationTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("paginationDesc")}</p>
                    <FieldTable title="PaginationResponse<T>" fields={[
                        { name: "content", type: "T[]", description: "Items for the current page" },
                        { name: "page", type: "integer", description: "Current page index (0-based)" },
                        { name: "size", type: "integer", description: "Page size (max 100)" },
                        { name: "totalElements", type: "integer", description: "Total number of items across all pages" },
                        { name: "totalPages", type: "integer", description: "Total number of pages" },
                        { name: "last", type: "boolean", description: "true if this is the last page" },
                    ]} />
                </section>
            </div>
        </div>
    );
}

// ── Success ───────────────────────────────────────────────────────────────────

export const responsesSuccessNavItems: RightNavItem[] = [
    { id: "responses-success-overview", label: "Overview", isActive: true },
    { id: "responses-success-example", label: "Example" },
];

export function DevelopersResponsesSuccess() {
    const t = useTranslations("Developers.ResponsesSuccess");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="responses-success-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <section id="responses-success-example" className="scroll-m-24">
                <h2 className="text-2xl font-bold mb-4">{t("exampleTitle")}</h2>
                <CodeBlock lang="json" code={`// HTTP 200/201 - success: true
{
  "success": true,
  "code": "CHECKOUT_CREATED",
  "message": "Payment session created.",
  "data": {
    "reference": "PI-A1B2C3D4E5F6",
    "status": "PENDING",
    "amount": 5000,
    "currency": "XAF",
    "paymentUrl": "https://checkout.sharepay.cm/pay/cs_a1b2c3d4e5f6"
  },
  "timestamp": "2026-08-04T12:00:00.000Z"
}`} />
            </section>
        </div>
    );
}

// ── Failed ────────────────────────────────────────────────────────────────────

export const responsesFailedNavItems: RightNavItem[] = [
    { id: "responses-failed-overview", label: "Overview", isActive: true },
    { id: "responses-failed-example", label: "Example" },
];

export function DevelopersResponsesFailed() {
    const t = useTranslations("Developers.ResponsesFailed");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="responses-failed-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <XCircle className="h-9 w-9 text-red-500 shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <section id="responses-failed-example" className="scroll-m-24">
                <h2 className="text-2xl font-bold mb-4">{t("exampleTitle")}</h2>
                <CodeBlock lang="json" code={`// HTTP 400 - malformed or invalid request
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Field 'amount' is required.",
  "data": null,
  "timestamp": "2026-08-04T12:00:01.000Z"
}`} />
            </section>
        </div>
    );
}

// ── Rejected ──────────────────────────────────────────────────────────────────

export const responsesRejectedNavItems: RightNavItem[] = [
    { id: "responses-rejected-overview", label: "Overview", isActive: true },
    { id: "responses-rejected-example", label: "Example" },
];

export function DevelopersResponsesRejected() {
    const t = useTranslations("Developers.ResponsesRejected");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="responses-rejected-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <ShieldAlert className="h-9 w-9 text-amber-500 shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <section id="responses-rejected-example" className="scroll-m-24">
                <h2 className="text-2xl font-bold mb-4">{t("exampleTitle")}</h2>
                <CodeBlock lang="json" code={`// HTTP 403 - request understood, but access is denied
{
  "success": false,
  "code": "ACCESS_DENIED",
  "message": "Your account does not have permission to perform this action.",
  "data": null,
  "timestamp": "2026-08-04T12:00:02.000Z"
}`} />
            </section>
        </div>
    );
}
