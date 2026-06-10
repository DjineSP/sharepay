# Architecture - Sharepay

> Documentation technique de l'architecture du projet frontend Sharepay.
> Générée le 26 février 2026.

---

## 1. Vue d'ensemble

Sharepay est une **plateforme de paiement en ligne pour marchands**. Elle permet aux utilisateurs (marchands) de :
- Créer et gérer des applications (sandbox / production) avec leurs clés API.
- Générer des liens de paiement partageables.
- Suivre leurs transactions et leur historique financier.
- Effectuer des retraits vers leurs comptes.
- Consulter la documentation développeur intégrée.

Le frontend est une **Single Page Application (SPA)** construite avec **Next.js 16 (App Router)**, communiquant avec un backend REST via Axios.

---

## 2. Stack Technique

| Catégorie | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Langage | TypeScript | ^5 |
| UI Styling | TailwindCSS | ^4 |
| Composants primitifs | Radix UI | varies |
| Tableaux | TanStack Table | ^8.21 |
| Animations | Framer Motion | ^12 |
| HTTP Client | Axios | ^1.13 |
| Internationalisation | next-intl | ^4.8 |
| Thème Dark/Light | next-themes | ^0.4 |
| Formulaires OTP | input-otp | ^1.4 |
| Dates | date-fns | ^4 |
| Toasts | sonner | ^2 |
| Icônes | lucide-react | ^0.563 |
| Téléphone | react-phone-number-input | ^3.4 |

---

## 3. Structure des dossiers

```
sharepay/
├── public/                      # Assets statiques
├── src/
│   ├── app/                     # Next.js App Router
│   │   └── [locale]/
│   │       ├── layout.tsx       # Layout racine (i18n, theme, toploader)
│   │       ├── not-found.tsx    # Page 404 personnalisée
│   │       ├── (auth)/          # Groupe de routes authentification
│   │       ├── (dashboard)/     # Groupe de routes dashboard (protégé)
│   │       └── (public)/        # Groupe de routes publiques
│   ├── components/              # Composants React
│   │   ├── dashboard/           # Composants du tableau de bord
│   │   ├── public/              # Composants des pages publiques
│   │   ├── shared/              # Composants transversaux réutilisables
│   │   ├── providers/           # Providers React
│   │   └── ui/                  # Primitives UI (shadcn/ui pattern)
│   ├── core/                    # Logique métier & infrastructure
│   │   ├── api/                 # Client HTTP Axios
│   │   ├── services/            # Couche service (appels API)
│   │   ├── types/               # Types TypeScript & DTOs
│   │   ├── lib/                 # Utilitaires (token, error codes)
│   │   ├── data/                # Données statiques / mock
│   │   └── i18n/                # Configuration i18n (routing, messages)
│   ├── lib/                     # Helpers généraux (cn, utils)
│   └── proxy.ts                 # Proxy de réécriture d'URL
├── next.config.ts               # Config Next.js (proxy API, next-intl)
├── tailwind.config.ts           # Config TailwindCSS
├── tsconfig.json                # Config TypeScript
└── components.json              # Config shadcn/ui
```

---

## 4. Architecture des routes (Next.js App Router)

Toutes les routes sont encapsulées dans le segment `[locale]` pour gérer l'internationalisation (fr/en), avec `localePrefix: 'never'` (le préfixe n'apparaît pas dans l'URL).

### 4.1 Groupe `(auth)` - Pages non protégées

| Route | Fichier | Description |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Connexion avec email/mot de passe |
| `/register` | `(auth)/register/page.tsx` | Inscription marchand |
| `/verify-email` | `(auth)/verify-email/page.tsx` | Vérification OTP email |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Demande de réinitialisation |
| `/verify-reset-code` | `(auth)/verify-reset-code/page.tsx` | Vérification OTP reset |
| `/reset-password` | `(auth)/reset-password/page.tsx` | Nouveau mot de passe |

### 4.2 Groupe `(dashboard)` - Routes protégées

| Route | Fichier | Description |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | Vue d'ensemble / Overview |
| `/dashboard/apps` | `dashboard/apps/page.tsx` | Gestion des applications |
| `/dashboard/transactions` | `dashboard/transactions/page.tsx` | Historique des transactions |
| `/dashboard/payment-links` | `dashboard/payment-links/page.tsx` | Liens de paiement |
| `/dashboard/payment-links/new` | `dashboard/payment-links/new/page.tsx` | Créer un lien de paiement |
| `/dashboard/withdrawals` | `dashboard/withdrawals/page.tsx` | Retraits |
| `/dashboard/notifications` | `dashboard/notifications/page.tsx` | Notifications |
| `/dashboard/profile` | `dashboard/profile/page.tsx` | Profil utilisateur |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Paramètres |

### 4.3 Groupe `(public)` - Pages marketing

| Route | Description |
|---|---|
| `/` | Landing page (Hero, Pricing, Integration, Security, Connectivity) |
| `/developers` | Documentation développeur |
| `/faq` | Foire aux questions |

---

## 5. Couche API (`src/core/`)

### 5.1 Client HTTP (`core/api/client.ts`)

Un client Axios singleton est configuré avec :
- `baseURL` : `process.env.NEXT_PUBLIC_API_URL` (fallback `http://localhost:8080/api/v1`)
- **Intercepteur de requête** : injecte automatiquement le header `Authorization: {tokenType} {accessToken}` depuis le `tokenStorage`.
- **Intercepteur de réponse** : gère les erreurs 401 avec une logique de **token refresh automatique** (appel à `/auth/refresh-token`). En cas d'échec du refresh, efface les tokens et redirige vers `/login`.

```
Client Axios
├── Request Interceptor  → Injecte Bearer token
└── Response Interceptor → Auto-refresh 401 → Redirect /login si échec
```

Le proxy Next.js (`next.config.ts`) redirige les appels `/api/v1/*` vers `http://localhost:8080/api/v1/*`, permettant de contourner les restrictions CORS en développement.

### 5.2 Services (`core/services/`)

#### `authService` (auth.service.ts)
Gère tout le cycle d'authentification :

| Méthode | Endpoint | Description |
|---|---|---|
| `login(data, rememberMe)` | `POST /auth/login` | Connexion, sauvegarde des tokens |
| `register(data)` | `POST /auth/register` | Inscription marchand |
| `verifyEmail(data)` | `POST /auth/verify-otp` | Vérification email OTP |
| `forgotPassword(data)` | `POST /auth/forgot-password` | Demande reset |
| `verifyResetCode(data)` | `POST /auth/verify-reset-otp` | Vérifie OTP reset, retourne `resetToken` |
| `resetPassword(data)` | `POST /auth/reset-password` | Nouveau MDP avec resetToken |
| `resendOtp(email)` | `POST /auth/resend-otp` | Renvoi OTP |
| `refreshToken(token)` | `POST /auth/refresh-token` | Rafraîchit l'accès |
| `logout()` | `POST /auth/logout` | Révocation du refresh token |

#### `appsService` (apps.service.ts)
Gère les applications marchandes et leurs clés API :

| Méthode | Endpoint | Description |
|---|---|---|
| `list()` | `GET /apps` | Toutes les apps |
| `listProduction()` | `GET /apps/production` | Apps PRODUCTION uniquement |
| `listSandbox()` | `GET /apps/sandbox` | Apps SANDBOX uniquement |
| `getById(id)` | `GET /apps/{id}` | Détail d'une app |
| `create(data)` | `POST /apps` | Crée une app (retourne les clés API) |
| `update(id, data)` | `PUT /apps/{id}` | Met à jour une app |
| `remove(id)` | `DELETE /apps/{id}` | Supprime une app |
| `getKeys(appId)` | `GET /apps/{id}/keys` | Liste les clés API |
| `rotateKeys(appId)` | `POST /apps/{id}/keys` | Régénère toutes les clés |
| `revokeKey(appId, keyId)` | `DELETE /apps/{id}/keys/{keyId}` | Révoque une clé |

### 5.3 Types (`core/types/`)

**`ApiResponse<T>`** : Wrapper standard uniformisant toutes les réponses de l'API.
```typescript
interface ApiResponse<T = void> {
  success: boolean;
  code: string;       // "SUCCESS", "AUTH_INVALID_CREDENTIALS", etc.
  message: string;
  data: T;
  timestamp: string;
}
```

**Types Auth** : `LoginRequest`, `RegisterRequest`, `VerifyEmailRequest`, `ForgotPasswordRequest`, `VerifyResetCodeRequest`, `ResetPasswordRequest`, `AuthTokenData`, `UserProfile`, `VerifyResetCodeResponse`

**Types Apps** : `AppResponse`, `ApiKeyResponse`, `CreateAppRequest`, `UpdateAppRequest`
- Enums : `AppEnvironment` (PRODUCTION | SANDBOX), `AppStatus` (ACTIVE | INACTIVE), `ApiKeyType` (PUBLIC | SECRET), `ApiKeyStatus` (ACTIVE | REVOKED)

### 5.4 Token Storage (`core/lib/token-storage.ts`)
Gère la persistance des tokens JWT dans `localStorage` (si `rememberMe`) ou `sessionStorage`. Expose : `get()`, `set(tokens, options)`, `clear()`.

---

## 6. Architecture des composants (`src/components/`)

### 6.1 Design System - Primitives UI (`components/ui/`)
Composants de base basés sur le pattern **shadcn/ui** (Radix UI + TailwindCSS + CVA) :

`avatar`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `input-otp`, `label`, `pagination`, `phone-input`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `table`, `tabs`, `textarea`

### 6.2 Composants Dashboard (`components/dashboard/`)

#### Layout global
- **`dashboard-sidebar.tsx`** : Sidebar collapsible avec navigation, liens vers toutes les sections dashboard, support dark/light mode.
- **`dashboard-header.tsx`** : Header avec sélecteur de langue, toggle thème, notifications, menu utilisateur.

#### Overview (`components/dashboard/overview/`)
- `overview-page-heading.tsx` : Titre de page avec date courante.
- `overview-stats-grid.tsx` : Grille de KPIs (solde, règlements en cours, volume journalier).
- `overview-transaction-chart-card.tsx` : Graphique de flux de transactions interactif avec sélecteur de plage temporelle.
- `overview-recent-activity.tsx` : Feed d'activité récente (transactions, remboursements).
- `overview-insight-card.tsx` : Carte de conseil d'optimisation.

#### Apps (`components/dashboard/apps/`)
- `app-card.tsx` : Carte affichant une application (nom, env, statut, actions).
- `apps-grid.tsx` : Grille d'apps avec onglets PRODUCTION/SANDBOX et bouton de création.
- `api-keys-reveal-modal.tsx` : Modal d'affichage des clés API (visible uniquement à la création/rotation).
- `delete-app-modal.tsx` : Modal de confirmation de suppression.
- `sections/app-general-section.tsx` : Infos générales de l'app.
- `sections/app-branding-section.tsx` : Logo, couleur de thème.
- `sections/app-config-section.tsx` : Configuration (webhook, fallback URL).
- `sections/app-keys-section.tsx` : Liste et gestion des clés API.
- `sections/app-webhooks-section.tsx` : Configuration des webhooks.

#### Transactions (`components/dashboard/transactions/`)
- `transactions-table.tsx` : Tableau paginé et filtrable des transactions (TanStack Table).
- `transactions-stats.tsx` : Statistiques de transactions.
- `transactions-app-selector.tsx` : Sélecteur d'application pour filtrer.

#### Payment Links (`components/dashboard/payment-links/`)
- `payment-links-table.tsx` : Tableau des liens de paiement (TanStack Table).
- `payment-link-stats.tsx` : Statistiques des liens de paiement.
- `new/product-details-section.tsx` : Détails produit (création lien).
- `new/pricing-section.tsx` : Tarification et devises (création lien).
- `new/branding-section.tsx` : Personnalisation visuelle (création lien).
- `new/advanced-options-section.tsx` : Options avancées (création lien).
- `new/payment-preview.tsx` : Aperçu temps réel du lien de paiement.

#### Withdrawals (`components/dashboard/withdrawals/`)
- `withdrawals-client-page.tsx` : Orchestrateur de la page retraits.
- `withdrawals-balance.tsx` : Affichage du solde disponible.
- `withdrawals-methods.tsx` : Sélection des méthodes de retrait.
- `withdrawals-form.tsx` : Formulaire de retrait.
- `withdrawals-config-modal.tsx` : Modal de configuration du mode de retrait.
- `withdrawals-history-table.tsx` : Historique des retraits.

#### Profile & Settings
- `components/dashboard/profile/` : Formulaires de modification du profil utilisateur.
- `components/dashboard/settings/` : Page de paramètres.

### 6.3 Composants Publics (`components/public/`)

#### Landing (`components/public/landing/`)
- `site-header.tsx` : Header public avec navigation et menu responsive.
- `hero-section.tsx` : Hero animé avec CTA.
- `integration-section.tsx` : Section intégrations (méthodes de paiement supportées).
- `pricing-section.tsx` : Plans tarifaires.
- `security-section.tsx` : Arguments sécurité.
- `connectivity-section.tsx` : Connectivité et disponibilité.
- `site-footer.tsx` : Footer avec liens et informations légales.
- `animations/` : Composants d'animation Framer Motion réutilisables.

#### Developers (`components/public/developers/`)
- `developers-sidebar.tsx` : Sidebar de navigation de la documentation.
- `developers-content.tsx` : Affichage du contenu de la section active.
- `developers-right-nav.tsx` : Navigation rapide dans la section courante.
- `doc-pagination.tsx` : Pagination entre sections de doc.
- `doc-config.ts` : Configuration de la structure de la documentation.
- `sections/` : Sections de contenu (getting-started, authentication...).

### 6.4 Composants Partagés (`components/shared/`)
- `language-switcher.tsx` : Sélecteur de langue FR/EN.
- `theme-toggle.tsx` : Bouton bascule Dark/Light mode.
- `public-auth-gate.tsx` : Redirection conditionnelle selon état d'authentification.
- `loader-page.tsx` : Écran de chargement.

### 6.5 Providers (`components/providers/`)
- `theme-provider.tsx` : Provider `next-themes` pour dark/light mode.

---

## 7. Internationalisation (i18n)

- **Bibliothèque** : `next-intl` v4
- **Locales supportées** : `fr` (défaut), `en`
- **Stratégie de préfixe** : `localePrefix: 'never'` - les URLs ne contiennent pas le préfixe de langue
- **Fichiers de messages** : `src/core/i18n/messages/fr.json` (~33 Ko), `en.json` (~31 Ko)
- **Routing** : `src/core/i18n/routing.ts` exporte `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` avec support i18n natif
- **Configuration serveur** : `src/core/i18n/request.ts` utilisé par `next.config.ts`

---

## 8. Gestion des tokens & Sécurité

```
Login → authService.login()
      → tokenStorage.set({ accessToken, refreshToken, tokenType }, { persist: rememberMe })
        ├── rememberMe: true  → localStorage
        └── rememberMe: false → sessionStorage

Client Axios interceptors:
  Request  → Lit tokenStorage.get() → Authorization header
  Response → 401 détecté → POST /auth/refresh-token
           → Succès : tokenStorage.set(newTokens) + retry original request
           → Échec   : tokenStorage.clear() + redirect /login
```

---

## 9. Flux de données (simplifié)

```
Page / Composant
    │
    ▼
Service (authService / appsService / ...)
    │
    ▼
client.ts (Axios singleton)
    │ + Interceptors (JWT inject / refresh)
    ▼
Backend REST API (http://localhost:8080/api/v1)
    │
    ▼
ApiResponse<T> { success, code, message, data, timestamp }
    │
    ▼
Service → retourne data ou throw Error(code)
    │
    ▼
Page / Composant → setState / affichage / toast d'erreur
```

---

## 10. Proxy & Configuration réseau

Le fichier `next.config.ts` configure une réécriture d'URL :
```
/api/v1/* → http://localhost:8080/api/v1/*
```
Cela permet aux requêtes frontend d'éviter les erreurs CORS en développement, car le client Axios pointe sur `NEXT_PUBLIC_API_URL` (variable `.env`).

---

## 11. Thème & Design

- **Dark/Light mode** : géré par `next-themes` avec un `ThemeProvider`.
- **Couleurs** : système de couleurs TailwindCSS personnalisé via `tailwind.config.ts` (CSS variables, tokens).
- **Animations** : Framer Motion utilisé pour les transitions de pages et les sections landing.
- **Top Loading Bar** : `nextjs-toploader` pour les transitions de navigation.
