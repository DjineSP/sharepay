"use client";

import { useTranslations } from "next-intl";
import { FileCode2 } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const sdkCsharpNavItems: RightNavItem[] = [
    { id: "sdk-csharp-overview", label: "Overview", isActive: true },
    { id: "sdk-csharp-client", label: "Minimal client" },
];

export function DevelopersSdkCsharp() {
    const t = useTranslations("Developers.SdkCsharp");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="sdk-csharp-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <FileCode2 className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <section id="sdk-csharp-client" className="scroll-m-24">
                <h2 className="text-2xl font-bold mb-4">{t("clientTitle")}</h2>
                <CodeBlock lang="csharp" title="SharePayClient.cs" code={`using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

public class SharePayClient
{
    private readonly HttpClient _http;

    public SharePayClient(string apiKey, string baseUrl = "${BASE_URL}")
    {
        _http = new HttpClient { BaseAddress = new Uri(baseUrl) };
        _http.DefaultRequestHeaders.Add("X-API-KEY", apiKey);
        _http.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<JsonElement> CreateCheckoutAsync(object payload)
    {
        var res = await _http.PostAsJsonAsync("/pay-in/checkout", payload);
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("data"); // { reference, status, paymentUrl }
    }

    public async Task<JsonElement> CreateChargeAsync(object payload)
    {
        var res = await _http.PostAsJsonAsync("/pay-in/charge", payload);
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("data");
    }

    public async Task<JsonElement> GetPayInStatusAsync(string reference)
    {
        var res = await _http.GetAsync($"/pay-in/check_status/{reference}");
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("data");
    }

    public async Task<JsonElement> CreateTransferAsync(object payload)
    {
        var res = await _http.PostAsJsonAsync("/pay-out/transfer", payload);
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("data");
    }
}

// Usage
var client = new SharePayClient(Environment.GetEnvironmentVariable("SHAREPAY_API_KEY")!);

var session = await client.CreateCheckoutAsync(new
{
    amount = 5000,
    currency = "XAF",
    description = "Order #001",
    successUrl = "https://your-site.cm/success",
    cancelUrl = "https://your-site.cm/cancel",
});

Console.WriteLine($"Payment link: {session.GetProperty("paymentUrl")}");`} />
            </section>
        </div>
    );
}
