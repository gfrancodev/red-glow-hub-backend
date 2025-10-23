# Guia de Testes E2E

Este documento descreve como executar e manter os testes end-to-end (E2E) da aplicação.

## 🚀 Execução Rápida

```bash
# Todos os testes E2E
npm run test:e2e

# Apenas testes de autenticação
npm run test:e2e:auth

# Modo watch (desenvolvimento)
npm run test:e2e:watch

# Usando o script personalizado
./test/run-e2e.sh
./test/run-e2e.sh auth
./test/run-e2e.sh auth auth.login.e2e.test.ts
```

## 📁 Estrutura dos Testes

```
src/modules/
├── auth/
│   └── e2e/
│       ├── auth.signup.e2e.test.ts    # Testes de cadastro
│       ├── auth.login.e2e.test.ts     # Testes de login
│       ├── auth.refresh.e2e.test.ts   # Testes de refresh token
│       └── auth.logout.e2e.test.ts    # Testes de logout
└── [outros-módulos]/
    └── e2e/
        └── *.e2e.test.ts

test/
├── setup.ts                 # Configuração global
├── utils/
│   ├── test-client.ts       # Cliente HTTP
│   └── auth-helper.ts       # Utilitários de auth
└── run-e2e.sh              # Script de execução
```

## 🧪 Cobertura de Testes

### Usuários de Seed

O sistema inclui usuários pré-criados no seed para testes específicos:

| Usuário     | Email              | Senha          | Role      | Status    | Descrição                |
| ----------- | ------------------ | -------------- | --------- | --------- | ------------------------ |
| `admin`     | admin@test.com     | admin123456    | admin     | active    | Administrador do sistema |
| `moderator` | moderator@test.com | mod123456      | moderator | active    | Moderador do sistema     |
| `player`    | player@test.com    | player123456   | player    | active    | Jogador comum            |
| `inactive`  | inactive@test.com  | inactive123456 | player    | suspended | Usuário suspenso         |

**Uso nos testes:**

```typescript
// Login direto
const response = await testClient.post('/v1/auth/login', {
  email: seedUsers.admin.email,
  password: seedUsers.admin.password,
});

// Usando AuthHelper
const adminToken = await AuthHelper.getSeedUserToken('admin');
const moderatorResponse = await AuthHelper.loginSeedUser('moderator');
```

### Módulo de Autenticação

#### Signup (`auth.signup.e2e.test.ts`)

- ✅ Cadastro com dados válidos
- ✅ Cadastro sem city_slug (opcional)
- ✅ Username com caracteres especiais
- ❌ Email duplicado (409)
- ❌ Username duplicado (409)
- ❌ Email inválido (422)
- ❌ Senha muito curta (422)
- ❌ Username muito curto (422)
- ❌ Username com caracteres inválidos (422)
- ❌ State com tamanho inválido (422)
- ❌ Campos obrigatórios ausentes (422)

#### Login (`auth.login.e2e.test.ts`)

- ✅ Login com credenciais válidas
- ✅ Login sem profile
- ✅ Tokens diferentes a cada login
- ❌ Email inexistente (401)
- ❌ Senha incorreta (401)
- ❌ Email inválido (422)
- ❌ Senha vazia (422)
- ❌ Email vazio (422)
- ❌ Body vazio (422)
- ❌ Campos ausentes (422)

#### Refresh Token (`auth.refresh.e2e.test.ts`)

- ✅ Renovação com token válido
- ✅ Múltiplas renovações
- ✅ Invalidação de token anterior
- ❌ Token inválido (401)
- ❌ Token vazio (422)
- ❌ Token ausente (422)
- ❌ Token expirado (401)
- ❌ Token de sessão inativa (401)
- ❌ Token malformado (401)
- ❌ Token com assinatura inválida (401)

#### Logout (`auth.logout.e2e.test.ts`)

- ✅ Logout com token válido
- ✅ Logout com refresh token opcional
- ✅ Invalidação de sessão
- ✅ Logout múltiplo
- ❌ Token ausente (401)
- ❌ Token inválido (401)
- ❌ Token malformado (401)
- ❌ Token expirado (401)
- ❌ Token vazio (401)
- ❌ Header Authorization malformado (401)

## 🛠️ Utilitários

### TestClient

Cliente HTTP configurado para requisições de teste:

```typescript
import { testClient } from '../../../../test/utils/test-client';

// Requisições básicas
await testClient.get('/v1/status/health');
await testClient.post('/v1/auth/login', data);
await testClient.put('/v1/users/123', data);
await testClient.delete('/v1/users/123');

// Com autenticação
await testClient.post('/v1/auth/logout', {}, testClient.withAuth(accessToken));
```

### AuthHelper

Utilitários para autenticação em testes:

```typescript
import { AuthHelper, seedUsers } from '../../../../test/utils/auth-helper';

// Criar usuário completo
const { user, authResponse } = await AuthHelper.createTestUser({
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
});

// Apenas tokens
const accessToken = await AuthHelper.getAccessToken();
const { access_token, refresh_token } = await AuthHelper.getTokenPair();

// Login de usuário existente
const authResponse = await AuthHelper.loginUser('email@example.com', 'password');

// Usar usuários pré-criados no seed
const adminToken = await AuthHelper.getSeedUserToken('admin');
const moderatorResponse = await AuthHelper.loginSeedUser('moderator');
const playerTokens = await AuthHelper.getSeedUserTokenPair('player');

// Usuários disponíveis no seed
console.log(seedUsers.admin); // admin@test.com (role: admin)
console.log(seedUsers.moderator); // moderator@test.com (role: moderator)
console.log(seedUsers.player); // player@test.com (role: player)
console.log(seedUsers.inactive); // inactive@test.com (status: suspended)
```

## 🔧 Configuração

### Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis:

```bash
# Banco de dados
DATABASE_URL="postgresql://user:pass@localhost:5432/player_test"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# API
API_VERSION="v1"
PORT=3001

# Redis (opcional)
REDIS_URL="redis://localhost:6379"
```

### Banco de Dados

Os testes usam o mesmo banco de dados da aplicação com limpeza automática:

- Dados são limpos antes de cada teste
- Dados são limpos após todos os testes
- Transações são usadas para isolamento

## 📊 Relatórios

### Execução com Relatório

```bash
# Relatório detalhado
npx vitest --reporter=verbose src/modules/auth/e2e

# Relatório JSON
npx vitest --reporter=json src/modules/auth/e2e > test-results.json

# Relatório HTML (com plugin)
npx vitest --reporter=html src/modules/auth/e2e
```

### Debug

```bash
# Modo debug
DEBUG=* npm run test:e2e:auth

# Logs detalhados
npx vitest --reporter=verbose --logLevel=debug src/modules/auth/e2e
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**

   ```bash
   # Verificar se o banco está rodando
   npx prisma db push
   ```

2. **Timeout nos testes**

   ```bash
   # Aumentar timeout no vitest.config.ts
   testTimeout: 60000
   ```

3. **Dados não limpos entre testes**

   ```bash
   # Verificar se o setup.ts está correto
   # Verificar se o banco está sendo limpo
   ```

4. **Tokens inválidos**
   ```bash
   # Verificar JWT_SECRET
   # Verificar se os tokens estão sendo gerados corretamente
   ```

### Logs de Debug

```typescript
// Adicionar logs nos testes
console.log('Response status:', response.status);
console.log('Response body:', response.body);
```

## 📈 Próximos Passos

1. **Adicionar testes para outros módulos**
   - Players
   - Files
   - Uploads
   - Reports
   - etc.

2. **Melhorar cobertura**
   - Testes de integração com serviços externos
   - Testes de performance
   - Testes de segurança

3. **Automação**
   - CI/CD pipeline
   - Relatórios automáticos
   - Notificações de falhas

4. **Monitoramento**
   - Métricas de cobertura
   - Tempo de execução
   - Taxa de sucesso
