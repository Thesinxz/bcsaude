FROM node:20-bookworm-slim AS base

# Instala dependências de compilação para better-sqlite3 e ferramentas de sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    sqlite3 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copia arquivos de dependência
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Instala dependências de produção e compila módulos nativos
RUN npm ci --include=dev

# Gera cliente Prisma
RUN npx prisma generate

# Copia código-fonte
COPY . .

# Build do Next.js
RUN npm run build

# Torna script de inicialização executável
RUN chmod +x start.sh

# Expõe a porta 3000
EXPOSE 3000

# Executa migrações e sobe o app
CMD ["./start.sh"]
