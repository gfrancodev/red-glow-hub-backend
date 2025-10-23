#!/bin/bash

# Script para executar testes E2E
# Uso: ./test/run-e2e.sh [módulo] [arquivo]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Executando testes E2E...${NC}"

# Verificar se o banco de dados está rodando
if ! npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao banco de dados${NC}"
    echo "Certifique-se de que o banco de dados está rodando e as variáveis de ambiente estão configuradas."
    exit 1
fi

# Executar testes baseado nos argumentos
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}📋 Executando todos os testes E2E...${NC}"
    npm run test:e2e
elif [ $# -eq 1 ]; then
    echo -e "${YELLOW}📋 Executando testes do módulo: $1${NC}"
    npx vitest src/modules/$1/e2e --run
elif [ $# -eq 2 ]; then
    echo -e "${YELLOW}📋 Executando teste específico: $1/$2${NC}"
    npx vitest src/modules/$1/e2e/$2 --run
else
    echo -e "${RED}❌ Uso incorreto${NC}"
    echo "Uso: $0 [módulo] [arquivo]"
    echo "Exemplos:"
    echo "  $0                    # Todos os testes"
    echo "  $0 auth               # Todos os testes do módulo auth"
    echo "  $0 auth auth.login.e2e.test.ts  # Teste específico"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Testes executados com sucesso!${NC}"
else
    echo -e "${RED}❌ Alguns testes falharam${NC}"
    exit 1
fi

