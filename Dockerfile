FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# 1. Instalação de dependências (incluindo devDependencies para build)
FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 2. Build da aplicação com TypeScript e Tailwind
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bcsaude?schema=public"

RUN npx prisma generate
RUN npm run build

# 3. Imagem de Execução Final (Ultraleve)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

RUN chmod +x ./start.sh

EXPOSE 3000

CMD ["./start.sh"]
