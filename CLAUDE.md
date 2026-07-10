# SharePay Frontend — Next.js

## Stack
- **Next.js 16.1.6**, React 19, TypeScript (strict)
- App Router avec segments `[locale]` (next-intl : `en` / `fr`)
- UI : shadcn/ui (Radix UI) + Tailwind CSS + Framer Motion + Lucide React
- Toasts : Sonner (`sonner`)
- Tables : TanStack Table v8
- HTTP : Axios (`src/lib/api/client.ts`) avec refresh token automatique et queue anti-race
- I18n : next-intl, messages dans `src/i18n/messages/{en,fr}.json`
- Pas de Redux ni Zustand — state local via hooks React natifs

## Architecture

```
src/
├── app/[locale]/
│   ├── (public)/       # Landing, FAQ, pricing, docs publiques
│   ├── (auth)/         # Login / register par rôle
│   ├── (merchant)/     # Dashboard marchand
│   ├── (admin)/        # Dashboard admin
│   └── (support)/      # Dashboard support
├── components/
│   ├── ui/             # Primitives shadcn/ui (ne pas modifier)
│   ├── shared/         # Composants transversaux (LanguageSwitcher, ThemeToggle…)
│   ├── merchant/       # Composants spécifiques au portail marchand
│   ├── admin/          # Composants admin
│   └── support/        # Composants support
├── features/{domain}/
│   ├── hooks/          # use-*.ts — logique d'état + appels service
│   ├── services/       # *.service.ts — appels HTTP typés
│   ├── types.ts        # Types TypeScript du domaine
│   └── index.ts        # Barrel export
├── lib/
│   ├── api/            # client.ts, error.ts, response.ts, types.ts
│   ├── token-storage.ts
│   └── utils.ts
├── providers/          # ThemeProvider, BreadcrumbProvider
└── i18n/               # routing.ts, request.ts, messages/
```

## Patterns à respecter

### Service (appel HTTP)
```typescript
// features/{domain}/services/{domain}.service.ts
import { client } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/api/response";
import { ApiResponse } from "@/lib/api/types";
import { FooData, CreateFooPayload } from "@/features/foo/types";

export const fooService = {
    async list(): Promise<FooData[]> {
        const res = await client.get<ApiResponse<FooData[]>>("/api/v1/foo");
        return parseApiResponse(res.data, res.status)!;
    },

    async create(payload: CreateFooPayload): Promise<FooData> {
        const res = await client.post<ApiResponse<FooData>>("/api/v1/foo", payload);
        return parseApiResponse(res.data, res.status)!;
    },
};
```

### Hook (état + chargement)
```typescript
// features/{domain}/hooks/use-foo.ts
import { useState, useEffect, useCallback } from "react";
import { fooService } from "@/features/foo/services/foo.service";
import { FooData } from "@/features/foo/types";

export function useFoo() {
    const [data,    setData]    = useState<FooData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        fooService.list()
            .then(setData)
            .catch((err) => setError(err?.message ?? "Erreur"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refetch: load };
}
```

### Composant page
```tsx
// app/[locale]/(merchant)/merchant/foo/page.tsx
import { useTranslations } from "next-intl";

export default function FooPage() {
    const t = useTranslations("merchant.foo");
    // ...
}
```

### Gestion des erreurs
- Toujours gérer les erreurs dans le hook, pas dans le composant
- Erreurs réseau → `ApiError` de `lib/api/error.ts`
- Afficher les erreurs avec `sonner` : `toast.error(error)`
- Ne jamais exposer les détails techniques à l'utilisateur

### Internationalisation
- Toutes les chaînes visibles par l'utilisateur DOIVENT être dans `src/i18n/messages/fr.json` **et** `src/i18n/messages/en.json`
- Accès via `useTranslations("namespace.key")` dans les composants
- Jamais de texte en dur dans les composants (`"Chargement..."` → clé i18n)

### Routing
- Toujours utiliser les helpers next-intl : `useRouter`, `Link` depuis `@/i18n/routing`
- Les routes privées sont protégées côté client par les layouts de chaque groupe
- Structure : `/[locale]/(merchant)/merchant/{page}`

### Thème et style
- Utiliser exclusivement les variables CSS de shadcn/ui et Tailwind
- Dark mode géré par `ThemeProvider` (`next-themes`)
- Icônes : Lucide React uniquement (pas d'autres librairies d'icônes)

## Commandes

```bash
# Développement
npm run dev

# Build de production
npm run build

# Linter
npm run lint

# Type check
npx tsc --noEmit

# Docker
docker compose up --build
```

## À ne pas faire
- Ne pas appeler `client` directement dans un composant — toujours passer par un service
- Ne pas stocker de données applicatives dans `localStorage` directement — utiliser `tokenStorage` uniquement pour les tokens
- Ne pas créer de composants dans `components/ui/` — ce dossier est réservé à shadcn/ui
- Ne pas hardcoder l'URL de l'API — utiliser `process.env.NEXT_PUBLIC_API_URL` via le client Axios
- Ne pas utiliser `any` en TypeScript — toujours typer explicitement
- Ne pas dupliquer les appels API entre plusieurs hooks — centraliser dans le service, partager via props ou context si besoin
