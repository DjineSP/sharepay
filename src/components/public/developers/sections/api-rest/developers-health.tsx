"use client";

import { useTranslations } from "next-intl";
import { HeartPulse } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock, EndpointHeader } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm";

export const healthNavItems: RightNavItem[] = [
    { id: "health-overview", label: "Overview", isActive: true },
    { id: "health-request", label: "Request" },
    { id: "health-response", label: "Response" },
];

export function DevelopersHealth() {
    const t = useTranslations("Developers.Health");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="health-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <HeartPulse className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <div className="space-y-16">
                <section id="health-request" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("requestTitle")}</h2>
                    <div className="space-y-4">
                        <EndpointHeader
                            method="GET"
                            path="/actuator/health"
                            description={t("requestDesc")}
                            authTag="public"
                        />
                        <CodeBlock lang="bash" code={`curl ${BASE_URL}/actuator/health`} />
                    </div>
                </section>

                <section id="health-response" className="scroll-m-24">
                    <h2 className="text-2xl font-bold mb-4">{t("responseTitle")}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t("responseDesc")}</p>
                    <CodeBlock lang="json" code={`{
  "status": "UP"
}`} />
                </section>
            </div>
        </div>
    );
}
