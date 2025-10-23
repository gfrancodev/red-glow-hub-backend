#!/bin/bash

# Script para executar testes E2E com servidor real
# Uso: ./test/run-e2e-with-server.sh [comando]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se o servidor está rodando
check_server() {
    echo -e "${YELLOW}🔍 Verificando se o servidor está rodando...${NC}"
    
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Servidor está rodando na porta 3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Servidor não está rodando na porta 3000${NC}"
        echo -e "${YELLOW}💡 Execute 'npm run dev' em outro terminal antes de rodar os testes${NC}"
        return 1
    fi
}

# Função para executar os testes
run_tests() {
    local test_command="$1"
    
    if [ -z "$test_command" ]; then
        test_command="npm run test:e2e"
    fi
    
    echo -e "${YELLOW}🧪 Executando testes E2E...${NC}"
    echo -e "${YELLOW}Comando: $test_command${NC}"
    
    eval "$test_command"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  (sem argumentos)  - Executa 'npm run test:e2e'"
    echo "  'auth'            - Executa 'npm run test:e2e:auth'"
    echo "  'watch'           - Executa 'npm run test:e2e:watch'"
    echo "  'help'            - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0                # Executa todos os testes E2E"
    echo "  $0 auth           # Executa apenas testes de autenticação"
    echo "  $0 watch          # Executa testes em modo watch"
}

# Verificar argumentos
case "${1:-}" in
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "auth")
        TEST_CMD="npm run test:e2e:auth"
        ;;
    "watch")
        TEST_CMD="npm run test:e2e:watch"
        ;;
    "")
        TEST_CMD="npm run test:e2e"
        ;;
    *)
        TEST_CMD="$1"
        ;;
esac

# Verificar se o servidor está rodando
if ! check_server; then
    exit 1
fi

# Executar os testes
run_tests "$TEST_CMD"

