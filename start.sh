#!/bin/sh
set -e

echo "=== Iniciando B&C Saúde Ocupacional (PostgreSQL) ==="

# Aplica as tabelas no banco de dados PostgreSQL
echo "Aplicando schema do Prisma no PostgreSQL..."
npx prisma db push --skip-generate || true

# Executa o seed caso o banco precise de dados iniciais
echo "Executando seed de configurações e unidades..."
npx tsx prisma/seed.ts || true

echo "Iniciando servidor Next.js na porta ${PORT:-3000}..."
exec npm run start
