# Testes E2E

Este diretório contém os testes end-to-end (E2E) da aplicação usando Vitest e Axios para requisições HTTP reais.

## Estrutura

```
test/
├── setup.ts                      # Configuração global dos testes
├── utils/
│   ├── test-client.ts            # Cliente HTTP usando Axios
│   └── auth-helper.ts            # Utilitários para autenticação
├── run-e2e-with-server.sh        # Script para executar com servidor real
└── README.md                     # Este arquivo

src/modules/[entity]/e2e/
└── *.e2e.test.ts                 # Testes E2E específicos de cada módulo
```

## Configuração

Os testes estão configurados para:

- Usar Vitest como framework de testes
- Conectar ao banco de dados de teste
- Limpar dados entre cada teste
- Usar Axios para requisições HTTP reais
- Verificar se o servidor está rodando antes dos testes

## Executando os Testes

### Pré-requisitos

1. **Servidor rodando**: O servidor deve estar rodando na porta 3000
2. **Banco de dados**: MongoDB deve estar configurado e acessível
3. **Variáveis de ambiente**: Arquivo `.env` deve estar configurado

### Comandos Disponíveis

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar apenas testes de autenticação
npm run test:e2e:auth

# Executar testes em modo watch
npm run test:e2e:watch
```

### Execução com Script Automatizado

```bash
# Usar o script que verifica se o servidor está rodando
./test/run-e2e-with-server.sh

# Executar apenas testes de autenticação
./test/run-e2e-with-server.sh auth

# Executar em modo watch
./test/run-e2e-with-server.sh watch
```

### Execução Manual

```bash
# Testes específicos de um módulo
npx vitest src/modules/auth/e2e

# Testes específicos de um arquivo
npx vitest src/modules/auth/e2e/auth.login.e2e.test.ts

# Modo watch (desenvolvimento)
npx vitest --watch src/modules/auth/e2e
```

## Utilitários

### TestClient

Cliente HTTP usando Axios configurado para fazer requisições reais para a aplicação durante os testes.

```typescript
import { testClient } from '../../../../test/utils/test-client';

// GET request
const response = await testClient.get('/v1/status/health');

// POST request com dados
const response = await testClient.post('/v1/auth/login', {
  email: 'test@example.com',
  password: 'password123',
});

// POST request com headers de autenticação
const response = await testClient.post('/v1/auth/logout', {}, testClient.withAuth(accessToken));
```

**Características:**

- Usa Axios para requisições HTTP reais
- Conecta ao servidor rodando na porta 3000 (configurável via `API_URL`)
- Retorna status HTTP e body da resposta
- Não lança exceções para status de erro (permite testar erros)

### AuthHelper

Utilitários para criar usuários de teste e obter tokens de autenticação.

```typescript
import { AuthHelper, seedUsers } from '../../../../test/utils/auth-helper';

// Criar usuário de teste
const { user, authResponse } = await AuthHelper.createTestUser({
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
});

// Obter apenas o access token
const accessToken = await AuthHelper.getAccessToken();

// Obter par de tokens
const { access_token, refresh_token } = await AuthHelper.getTokenPair();

// Usar usuários pré-criados no seed
const adminToken = await AuthHelper.getSeedUserToken('admin');
const moderatorResponse = await AuthHelper.loginSeedUser('moderator');
const playerTokens = await AuthHelper.getSeedUserTokenPair('player');

// Usuários disponíveis no seed
console.log(seedUsers.admin); // admin@test.com
console.log(seedUsers.moderator); // moderator@test.com
console.log(seedUsers.player); // player@test.com
console.log(seedUsers.inactive); // inactive@test.com (suspended)
```

## Padrões de Teste

### Estrutura dos Testes

Cada arquivo de teste segue o padrão:

- **Casos Positivos**: Testam o comportamento esperado com dados válidos
- **Casos Negativos**: Testam validações e tratamento de erros

### Nomenclatura

- Arquivos: `[entity].[action].e2e.test.ts`
- Describes: `POST /v1/[endpoint]`
- Tests: Descrição em português do que está sendo testado

### Exemplo de Teste

```typescript
describe('POST /v1/auth/login', () => {
  describe('Casos Positivos', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const { user } = await AuthHelper.createTestUser();

      // Act
      const response = await testClient.post('/v1/auth/login', {
        email: user.email,
        password: user.password,
      });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para credenciais inválidas', async () => {
      // Act
      const response = await testClient.post('/v1/auth/login', {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Banco de Dados

Os testes usam o mesmo banco de dados da aplicação, mas com limpeza automática:

- **beforeAll**: Limpa dados antes de todos os testes
- **afterAll**: Limpa dados após todos os testes
- **beforeEach**: Limpa dados entre cada teste

## Variáveis de Ambiente

Certifique-se de que as variáveis de ambiente estão configuradas corretamente para os testes:

- `DATABASE_URL`: URL do banco de dados
- `JWT_SECRET`: Chave secreta para JWT
- `API_VERSION`: Versão da API (padrão: v1)
