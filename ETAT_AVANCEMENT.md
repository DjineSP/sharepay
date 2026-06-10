# État d'Avancement - Sharepay

> Recensement de tout ce qui est déjà implémenté dans le projet, avec description technique.
> Mis à jour le 26 février 2026.

---

## Légende

| Symbole | Signification |
|---|---|
| ✅ | Complet et fonctionnel |
| 🔶 | Partiellement implémenté (UI faite, logique mock/statique) |
| 🔴 | Non commencé / Manquant |
| 📌 | Note technique importante |

---

## 1. Infrastructure & Configuration

### ✅ Projet Next.js App Router configuré
- Next.js 16 avec App Router et TypeScript strict
- TailwindCSS v4 avec postcss
- ESLint configuré
- `tsconfig.json` avec alias `@/` pointant sur `src/`

### ✅ Proxy API côté Next.js
- `next.config.ts` : réécriture de `/api/v1/*` → `http://localhost:8080/api/v1/*`
- Variable d'environnement `NEXT_PUBLIC_API_URL` pour la base URL

### ✅ Client HTTP Axios (`core/api/client.ts`)
- Instance Axios singleton avec `baseURL` depuis `.env`
- **Intercepteur de requête** : injection automatique du token Bearer
- **Intercepteur de réponse** : gestion des 401 avec **refresh automatique** du token
- En cas d'échec du refresh : nettoyage des tokens + redirection `/login`
- Protection contre les boucles infinies (`_retry` flag, exclusion routes login/refresh)

### ✅ Gestion des tokens (`core/lib/token-storage.ts`)
- Persistance dans `localStorage` (si `rememberMe`) ou `sessionStorage` (défaut)
- API : `get()`, `set(tokens, options)`, `clear()`

### ✅ Codes d'erreur (`core/lib/error-codes.ts`)
- Fichier centralisant les codes d'erreur API

### ✅ Internationalisation (`next-intl`)
- Locales : `fr` (défaut), `en`
- `localePrefix: 'never'` - URLs sans préfixe de langue
- Fichiers de messages complets : `fr.json` (~33 Ko) et `en.json` (~31 Ko)
- Composants de navigation i18n exportés depuis `core/i18n/routing.ts`

### ✅ Thème Dark/Light (`next-themes`)
- `ThemeProvider` dans `components/providers/theme-provider.tsx`
- `ThemeToggle` dans `components/shared/theme-toggle.tsx`

---

## 2. Authentification

### ✅ Service Auth (`core/services/auth.service.ts`)

Tous les endpoints du cycle d'authentification sont implémentés :

| Fonctionnalité | Méthode | Endpoint |
|---|---|---|
| Inscription | `register()` | POST `/auth/register` |
| Vérification email OTP | `verifyEmail()` | POST `/auth/verify-otp` |
| Renvoi OTP | `resendOtp()` | POST `/auth/resend-otp` |
| Connexion | `login()` | POST `/auth/login` |
| Mot de passe oublié | `forgotPassword()` | POST `/auth/forgot-password` |
| Vérification OTP reset | `verifyResetCode()` | POST `/auth/verify-reset-otp` |
| Réinitialisation MDP | `resetPassword()` | POST `/auth/reset-password` |
| Rafraîchissement token | `refreshToken()` | POST `/auth/refresh-token` |
| Déconnexion | `logout()` | POST `/auth/logout` |

📌 `loginWithGoogle()` est déclarée mais non implémentée (throw NotImplemented).

### ✅ Types Auth (`core/types/auth.types.ts`)
- `ApiResponse<T>` - wrapper générique standard
- `RegisterRequest`, `LoginRequest`, `VerifyEmailRequest`
- `ForgotPasswordRequest`, `VerifyResetCodeRequest`, `ResetPasswordRequest`
- `AuthTokenData`, `UserProfile`, `VerifyResetCodeResponse`

### ✅ Pages Auth (routes)
Toutes les routes `(auth)` sont créées :
- `/login` - Connexion
- `/register` - Inscription
- `/verify-email` - Vérification OTP
- `/forgot-password` - Mot de passe oublié
- `/verify-reset-code` - Vérification OTP reset
- `/reset-password` - Nouveau mot de passe

---

## 3. Dashboard - Layout général

### ✅ Sidebar (`components/dashboard/dashboard-sidebar.tsx`)
- Navigation vers toutes les sections du dashboard
- Design collapsible
- Support des thèmes dark/light

### ✅ Header (`components/dashboard/dashboard-header.tsx`)
- Sélecteur de langue (`LanguageSwitcher`)
- Toggle thème Dark/Light
- Menu notifications
- Menu utilisateur avec déconnexion

### ✅ Layout Dashboard (`app/(dashboard)/layout.tsx`)
- Protège les routes dashboard
- Intègre sidebar + header

---

## 4. Dashboard - Overview (Tableau de bord principal)

### 🔶 Page Overview (`dashboard/page.tsx`)
- **Structure UI complète** : heading, grille de stats, graphique de transactions, activité récente, carte de conseil
- **Données statiques/mock** : les KPIs et activités récentes sont des données codées en dur
- **Pas encore connecté** au backend (aucun appel API réel)

#### Composants Overview ✅ (UI complète)
- `OverviewPageHeading` : titre + sous-titre avec traductions
- `OverviewStatsGrid` : grille de 3 cartes KPI (solde, règlements, volume journalier) avec icônes, badges, et barres de progression
- `OverviewTransactionChartCard` : graphique de transactions interactif avec sélecteur de plage temporelle (7j, 30j, 90j, personnalisé) - données générées par `core/data/dashboard.ts`
- `OverviewRecentActivity` : feed d'activité avec scroll (commandes, remboursements, échecs)
- `OverviewInsightCard` : carte de conseil d'optimisation avec CTA

📌 **Le graphique de transactions utilise des données mock** générées côté client par `buildSeries()` dans `core/data/dashboard.ts`.

---

## 5. Dashboard - Applications (Apps)

### ✅ Types Apps (`core/types/apps.types.ts`)
- `AppResponse`, `ApiKeyResponse`, `CreateAppRequest`, `UpdateAppRequest`
- Enums : `AppEnvironment`, `AppStatus`, `ApiKeyType`, `ApiKeyStatus`

### ✅ Service Apps (`core/services/apps.service.ts`)
- CRUD complet : `list()`, `listProduction()`, `listSandbox()`, `getById()`, `create()`, `update()`, `remove()`
- Gestion des clés API : `getKeys()`, `rotateKeys()`, `revokeKey()`

### ✅ Composants Apps (UI complète)
- `AppCard` : carte affichant une app avec son environnement (badge PROD/SANDBOX), statut, actions contextuelles
- `AppsGrid` : grille d'apps avec onglets PRODUCTION / SANDBOX / TOUTES, bouton de création, états vides
- `ApiKeysRevealModal` : modal d'affichage des clés API générées (affiché une seule fois à la création ou après rotation)
- `DeleteAppModal` : modal de confirmation de suppression

#### Sections de détail d'une App ✅
- `AppGeneralSection` : nom, description, URL du site
- `AppBrandingSection` : logo, couleur de thème avec color picker
- `AppConfigSection` : webhook URL, fallback URL, statut
- `AppKeysSection` : affichage des clés publique/secrète avec bouton de copie et rotation
- `AppWebhooksSection` : configuration des webhooks

### ✅ Page Apps (`dashboard/apps/page.tsx`)

---

## 6. Dashboard - Transactions

### ✅ Composants Transactions (UI complète)
- `TransactionsTable` : tableau complet avec TanStack Table - pagination, filtrage par statut/période, colonnes triables, affichage du statut API brut (`statut`)
- `TransactionsStats` : résumé statistique (nombre de transactions, montants)
- `TransactionsAppSelector` : sélecteur d'application pour filtrer les transactions

### 🔶 Page Transactions (`dashboard/transactions/page.tsx`)
- UI complète
- **Données mock** (pas encore connecté au backend)

---

## 7. Dashboard - Liens de Paiement (Payment Links)

### ✅ Composants Payment Links (UI complète)

#### Liste
- `PaymentLinksTable` : tableau avec TanStack Table - pagination, filtres, colonnes (nom, montant, statut, vues, conversions)
- `PaymentLinkStats` : statistiques (total, actifs, montant généré, taux de conversion)

#### Création (`payment-links/new/`)
- `ProductDetailsSection` : nom du produit, description, URL image
- `PricingSection` : montant, devise, type de paiement (fixe/libre)
- `BrandingSection` : personnalisation visuelle (couleur, logo)
- `AdvancedOptionsSection` : limite d'utilisations, date d'expiration, redirection après paiement
- `PaymentPreview` : aperçu temps réel du lien en cours de création

### 🔶 Pages Payment Links
- Liste : UI complète - **données mock**
- Nouvelle : formulaire multi-sections complet - **pas encore connecté au backend**

---

## 8. Dashboard - Retraits (Withdrawals)

### ✅ Composants Withdrawals (UI complète)
- `WithdrawalsClientPage` : orchestrateur de la page (logique d'état globale)
- `WithdrawalsBalance` : affichage du solde disponible
- `WithdrawalsMethods` : sélection de la méthode de retrait (Mobile Money, Virement, etc.)
- `WithdrawalsForm` : formulaire de saisie du montant et informations de retrait
- `WithdrawalsConfigModal` : modal de configuration du mode de retrait
- `WithdrawalsHistoryTable` : tableau historique des retraits passés

### 🔶 Page Withdrawals
- UI complète - **données mock**, pas encore connecté au backend

---

## 9. Dashboard - Notifications

### 🔶 Page Notifications (`dashboard/notifications/page.tsx`)
- Route créée, contenu à définir

---

## 10. Dashboard - Profil & Paramètres

### 🔶 Page Profil (`dashboard/profile/page.tsx`)
- Composants dans `components/dashboard/profile/` (4 fichiers)
- UI présente, connexion API à finaliser

### 🔶 Page Paramètres (`dashboard/settings/page.tsx`)
- Route créée, composants dans `components/dashboard/settings/`

---

## 11. Pages Publiques (Marketing)

### ✅ Landing Page

| Section | Fichier | Description |
|---|---|---|
| Header | `site-header.tsx` | Navigation responsive avec menu mobile, liens auth |
| Hero | `hero-section.tsx` | Section principale avec CTA animé |
| Integration | `integration-section.tsx` | Méthodes de paiement supportées |
| Pricing | `pricing-section.tsx` | Plans tarifaires |
| Security | `security-section.tsx` | Arguments sécurité (chiffrement, certifications) |
| Connectivity | `connectivity-section.tsx` | Disponibilité et couverture réseau |
| Footer | `site-footer.tsx` | Liens légaux, réseaux sociaux |
| Animations | `animations/` | Composants d'animation Framer Motion |

### ✅ Page Développeurs (`/developers`)
Documentation technique intégrée avec :
- `DevelopersSidebar` : navigation par sections (Getting Started, API Reference, Webhooks...)
- `DevelopersContent` : rendu du contenu de la section active
- `DevelopersRightNav` : navigation rapide dans la section (ancres)
- `DocPagination` : navigation précédent/suivant entre sections
- `doc-config.ts` : configuration centralisée de la structure de la doc

### ✅ Page FAQ (`/faq`)
- Page FAQ publique créée

---

## 12. Composants Partagés & Design System

### ✅ Primitives UI (`components/ui/`) - 20 composants

| Composant | Usage |
|---|---|
| `button` | Boutons avec variantes (default, outline, ghost, destructive...) |
| `card` | Conteneur de carte avec header/content/footer |
| `dialog` | Modals accessibles (Radix Dialog) |
| `dropdown-menu` | Menus déroulants (Radix DropdownMenu) |
| `input` | Champs de saisie stylisés |
| `input-otp` | Saisie de codes OTP (6 chiffres) |
| `phone-input` | Saisie de téléphone international avec indicatif |
| `select` | Sélecteur stylisé (Radix Select) |
| `table` | Tableau stylisé TailwindCSS |
| `tabs` | Onglets (Radix Tabs) |
| `badge` | Badges colorés |
| `avatar` | Avatars avec fallback |
| `pagination` | Composant de pagination |
| `scroll-area` | Zone scrollable personnalisée |
| `separator` | Séparateur visuel |
| `sheet` | Panneaux latéraux (Radix Dialog modal) |
| `checkbox` | Cases à cocher |
| `radio-group` | Boutons radio |
| `label` | Labels accessibles |
| `textarea` | Zones de texte |

### ✅ Composants Shared (`components/shared/`)
- `LanguageSwitcher` : sélecteur FR/EN avec drapeaux
- `ThemeToggle` : bascule Dark/Light
- `PublicAuthGate` : redirection conditionnelle selon l'état d'authentification
- `LoaderPage` : spinner de chargement plein écran

---

## 13. Résumé Général

| Module | UI | Logique / API | État |
|---|---|---|---|
| Infrastructure (config, proxy, Axios, tokens) | - | ✅ | ✅ Complet |
| Auth (service, types, pages) | ✅ | ✅ | ✅ Complet |
| Dashboard Layout (sidebar, header) | ✅ | ✅ | ✅ Complet |
| Overview (chart, stats, activities) | ✅ | 🔶 Mock | 🔶 UI faite, données mock |
| Apps (CRUD, clés API) | ✅ | ✅ | ✅ Complet |
| Transactions (tableau, stats) | ✅ | 🔶 Mock | 🔶 UI faite, données mock |
| Payment Links (liste, création) | ✅ | 🔶 Mock | 🔶 UI faite, données mock |
| Withdrawals (formulaire, historique) | ✅ | 🔶 Mock | 🔶 UI faite, données mock |
| Notifications | 🔶 | 🔴 | 🔶 Ébauche |
| Profil | 🔶 | 🔶 | 🔶 UI présente |
| Paramètres | 🔶 | 🔴 | 🔶 Ébauche |
| Landing Page | ✅ | - | ✅ Complet |
| Documentation Développeur | ✅ | - | ✅ Complet |
| FAQ | ✅ | - | ✅ Complet |
| i18n (FR + EN) | ✅ | - | ✅ Complet |
| Design System (UI primitives) | ✅ | - | ✅ Complet |

---

## 14. Points d'attention & prochaines étapes

1. **Connexion API réelle** : Les pages Overview, Transactions, Payment Links et Withdrawals utilisent encore des données mock. La priorité est de les connecter aux vrais endpoints backend.
2. **Service manquants** : Il n'existe pas encore de services pour les transactions, les liens de paiement, les retraits et les notifications (à créer dans `core/services/`).
3. **Gestion de l'état utilisateur** : Pas de store global (Redux/Zustand/Context) - la session est gérée uniquement via les tokens stockés. Un `AuthContext` ou un hook `useCurrentUser` pourrait centraliser l'état de l'utilisateur connecté.
4. **Authentification côté serveur** : Le middleware Next.js pour protéger les routes côté serveur n'est pas encore visible - à vérifier ou à implémenter si absent.
5. **Google Sign-In** : `loginWithGoogle()` est déclarée mais non implémentée.
6. **Tests** : Aucun fichier de test n'est présent (unitaires, intégration, e2e).
