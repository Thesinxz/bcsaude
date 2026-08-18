#!/bin/sh
set -e

echo "=== Iniciando B&C Saúde Ocupacional ==="

# Garante que o diretório do banco de dados exista com permissões adequadas
mkdir -p /app/prisma

# Aplica as tabelas no banco de dados SQLite
echo "Aplicando schema do Prisma..."
npx prisma db push --skip-generate

# Executa o seed caso o banco esteja vazio
echo "Verificando dados iniciais e seed..."
npx tsx prisma/seed.ts || true

echo "Iniciando servidor Next.js na porta ${PORT:-3000}..."
exec npm run start
