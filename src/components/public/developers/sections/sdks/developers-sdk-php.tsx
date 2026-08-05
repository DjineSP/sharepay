"use client";

import { useTranslations } from "next-intl";
import { FileCode2 } from "lucide-react";
import { RightNavItem } from "../../developers-right-nav";
import { CodeBlock } from "../../doc-widgets";

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://api.sharepay.cm/api/v1";

export const sdkPhpNavItems: RightNavItem[] = [
    { id: "sdk-php-overview", label: "Overview", isActive: true },
    { id: "sdk-php-client", label: "Minimal client" },
];

export function DevelopersSdkPhp() {
    const t = useTranslations("Developers.SdkPhp");

    return (
        <div className="max-w-[70rem] mx-auto pb-16">
            <h1 id="sdk-php-overview" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 scroll-m-24 flex items-center gap-3">
                <FileCode2 className="h-9 w-9 text-primary shrink-0" />
                {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {t("description")}
            </p>

            <section id="sdk-php-client" className="scroll-m-24">
                <h2 className="text-2xl font-bold mb-4">{t("clientTitle")}</h2>
                <CodeBlock lang="php" title="SharePayClient.php" code={`<?php

class SharePayClient
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct(string $apiKey, string $baseUrl = '${BASE_URL}')
    {
        $this->apiKey  = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    private function request(string $method, string $path, array $body = []): array
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $this->baseUrl . $path,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => strtoupper($method),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-API-KEY: ' . $this->apiKey,
            ],
        ]);
        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }

    public function createCheckout(array $params): array
    {
        $res = $this->request('POST', '/pay-in/checkout', $params);
        return $res['data']; // ['reference', 'status', 'paymentUrl']
    }

    public function createCharge(array $params): array
    {
        $res = $this->request('POST', '/pay-in/charge', $params);
        return $res['data'];
    }

    public function getPayInStatus(string $reference): array
    {
        $res = $this->request('GET', '/pay-in/check_status/' . $reference);
        return $res['data'];
    }

    public function createTransfer(array $params): array
    {
        $res = $this->request('POST', '/pay-out/transfer', $params);
        return $res['data'];
    }
}

$client = new SharePayClient($_ENV['SHAREPAY_API_KEY']);

$session = $client->createCheckout([
    'amount'      => 5000,
    'currency'    => 'XAF',
    'description' => 'Order #001',
    'successUrl'  => 'https://your-site.cm/success',
    'cancelUrl'   => 'https://your-site.cm/cancel',
]);

header('Location: ' . $session['paymentUrl']);
exit;`} />
            </section>
        </div>
    );
}
