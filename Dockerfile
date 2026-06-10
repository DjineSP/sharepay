# ============================================================
# STAGE 1 - Dépendances
# Installe uniquement les dépendances npm
# ============================================================
FROM node:22-alpine AS deps

WORKDIR /app

RUN npm install -g npm@11

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts


# ============================================================
# STAGE 2 - Build
# Compile l'application Next.js en mode standalone
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Récupère les dépendances du stage précédent
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables publiques injectées au moment du build
# Valeurs fournies via docker-compose (args:) depuis le .env
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_DOCS_BASE_URL=http://localhost:8080
ARG NEXT_PUBLIC_SWAGGER_URL=http://localhost:8080/swagger-ui/devs/sharepay-docs

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DOCS_BASE_URL=$NEXT_PUBLIC_DOCS_BASE_URL
ENV NEXT_PUBLIC_SWAGGER_URL=$NEXT_PUBLIC_SWAGGER_URL

RUN npm run build


# ============================================================
# STAGE 3 - Production
# Image finale légère avec uniquement le build standalone
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Environnement de production
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
# PORT et autres variables runtime fournis via .env au démarrage

# Utilisateur non-root pour la sécurité
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

# Copie uniquement les fichiers nécessaires au runtime
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Port documentaire uniquement - le vrai binding est dans docker-compose (ports:)
EXPOSE 3000

CMD ["node", "server.js"]