# Player Platform API

Uma API completa para plataforma de jogadores com Node.js, TypeScript, Prisma, MongoDB, Cloudflare R2 e Mercado Pago PIX.

## 🚀 Tecnologias

- **Runtime**: Node.js + Express
- **Database**: MongoDB + Prisma
- **Auth**: JWT com refresh tokens
- **Storage**: Cloudflare R2 com presigned URLs
- **Payment**: Mercado Pago PIX
- **Rate Limiting**: Redis
- **Code Quality**: ESLint + Prettier
- **Type Safety**: TypeScript 100%

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB
- Redis
- Conta Cloudflare R2
- Conta Mercado Pago

## 🛠️ Instalação

1. **Clone o repositório**

```bash
git clone <repository-url>
cd player
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/player"

# JWT Secrets (gere chaves seguras)
JWT_SECRET="your-super-secret-jwt-key-32-chars-min"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-32-chars-min"

# Redis
REDIS_URL="redis://localhost:6379"

# Cloudflare R2
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="your-bucket-name"

# Mercado Pago
MP_ACCESS_TOKEN="your-mercadopago-access-token"

# API Configuration
API_VERSION="v1"
PORT="3000"
NODE_ENV="development"

# Optional
HCAPTCHA_SECRET="your-hcaptcha-secret"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX="100"
```

4. **Configure o banco de dados**

```bash
# Gere o cliente Prisma
npm run prisma:generate

# Aplique o schema no MongoDB
npm run prisma:push

# Execute o seed inicial
npm run seed
```

## 🚀 Executando

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia com hot reload
npm run build            # Compila TypeScript
npm start                # Inicia versão compilada

# Qualidade de código
npm run lint             # Executa ESLint com auto-fix
npm run lint:check       # Verifica sem corrigir
npm run format           # Formata com Prettier
npm run format:check     # Verifica formatação
npm run format:lint      # Formata e executa lint
npm run type-check       # Verifica tipos TypeScript

# Banco de dados
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:push      # Aplica schema no DB
npm run prisma:studio    # Abre Prisma Studio
npm run seed             # Executa seed inicial

# Testes
npm run test             # Executa testes unitários
npm run test:e2e         # Executa testes e2e
```

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── app/                 # Configuração da aplicação
│   ├── app.ts          # Factory do Express
│   └── server.ts       # Bootstrap do servidor
├── modules/            # Módulos de negócio
│   ├── auth/           # Autenticação
│   ├── boost/          # Sistema de boost
│   ├── contact/        # Formulários de contato
│   ├── files/          # Upload de arquivos
│   ├── locations/      # Localizações
│   ├── players/        # Descoberta de jogadores
│   ├── profiles/       # Perfis de usuários
│   ├── reports/        # Sistema de denúncias
│   ├── session/        # Gerenciamento de sessões
│   ├── tags/           # Tags de jogadores
│   ├── uploads/        # Callbacks de upload
│   ├── users/          # Usuários
│   └── webhooks/       # Webhooks de pagamento
└── shared/             # Código compartilhado
    ├── config/         # Configurações
    ├── core/           # Utilitários core
    ├── db/             # Database utilities
    ├── errors/         # Sistema de erros
    ├── middleware/     # Middlewares
    ├── services/       # Serviços externos
    └── utils/          # Utilitários
```

### Principais Funcionalidades

#### 🔐 Autenticação

- Registro e login com JWT
- Refresh tokens com sessões no banco
- Middleware de autenticação e RBAC
- Gerenciamento de sessões

#### 📁 Upload de Arquivos

- Integração com Cloudflare R2
- Presigned URLs para upload seguro
- Callback para processamento de mídia
- Validação de tipos e tamanhos

#### 👥 Gestão de Perfis

- CRUD completo de perfis de jogadores
- Upload e gerenciamento de mídia
- Sistema de tags e localização
- Busca e descoberta pública

#### 💰 Sistema de Boost

- Integração com Mercado Pago PIX
- Planos de boost (Basic, Premium, VIP)
- Webhooks para confirmação de pagamento
- Gerenciamento de status de boost

#### 📊 Descoberta e Busca

- Listagem pública de jogadores
- Busca por tags, localização, nome
- Sistema de trending
- Paginação cursor-based

#### 🛡️ Moderação

- Sistema de denúncias
- Formulários de contato
- Rate limiting com Redis
- Logs de auditoria

## 🔧 Configuração do ESLint + Prettier

O projeto está configurado com as melhores práticas:

### ESLint

- TypeScript com regras recomendadas
- Integração com Prettier
- Regras de qualidade de código
- Suporte a Node.js e Express

### Prettier

- Formatação consistente
- Configuração otimizada para TypeScript
- Integração com ESLint

### VSCode

Configure seu editor com as extensões recomendadas:

- ESLint
- Prettier
- Prisma
- TypeScript

## 🌐 Endpoints Principais

### Públicos

- `GET /v1/players` - Lista jogadores
- `GET /v1/players/:username` - Perfil público
- `GET /v1/search` - Busca global
- `GET /v1/tags` - Lista tags
- `GET /v1/locations/states` - Estados
- `POST /v1/contact/:username` - Contato
- `POST /v1/reports` - Denúncias

### Autenticados

- `POST /v1/auth/signup` - Registro
- `POST /v1/auth/login` - Login
- `POST /v1/auth/refresh` - Renovar token
- `POST /v1/auth/logout` - Logout
- `GET /v1/session` - Info da sessão
- `GET /v1/me/profile` - Meu perfil
- `PUT /v1/me/profile` - Atualizar perfil
- `POST /v1/files/presign` - Upload de arquivo
- `POST /v1/me/boost/checkout` - Comprar boost

## 🚀 Deploy

### Variáveis de Ambiente de Produção

Certifique-se de configurar:

```env
NODE_ENV="production"
DATABASE_URL="mongodb+srv://..."
REDIS_URL="redis://..."
# ... outras configurações
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Documentação da API

A API segue o padrão REST com:

- **Versionamento**: `/v1/` em todas as rotas
- **Formato de resposta**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { ... }
  }
  ```
- **Tratamento de erros** padronizado
- **Paginação** cursor-based
- **Rate limiting** por IP/usuário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação
2. Procure por issues similares
3. Abra uma nova issue com detalhes do problema

---

**Desenvolvido com ❤️ para a comunidade de jogadores**
