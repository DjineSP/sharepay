"use client";

import { DevelopersContent } from "@/components/public/developers/developers-content";

export default function DocsPage() {
    return (
        // Le layout (public) impose un header fixe de 4rem : on borne la hauteur
        // pour que la sidebar et le contenu scrollent indépendamment.
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col">
            <DevelopersContent />
        </div>
    );
}
