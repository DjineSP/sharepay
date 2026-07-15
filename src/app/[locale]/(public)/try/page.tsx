import { SubscriptionHero } from "@/components/public/test-api/subscription-hero";
import { SubscriptionDemo } from "@/components/public/test-api/subscription-demo";

export default function TryPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <SubscriptionHero />
            <SubscriptionDemo />
        </div>
    );
}
