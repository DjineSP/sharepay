"use client";

import { FeaturesHero } from "@/components/public/landing/features/features-hero";
import { FeaturesGrid } from "@/components/public/landing/features/features-grid";
import { FeatureDetail, FeaturesCTA } from "@/components/public/landing/features/feature-detail-sections";

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <FeaturesHero />
            <FeaturesGrid />
            <FeatureDetail />
            <FeaturesCTA />
        </div>
    );
}
