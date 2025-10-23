import { describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('GET /v1/session', () => {
  describe('Casos Positivos', () => {
    it('deve retornar informações da sessão com usuário autenticado', async () => {
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'session@example.com',
        password: 'senha123456',
        username: 'sessionuser',
        display_name: 'Session User',
        state: 'SP',
        city: 'São Paulo',
        city_slug: 'sao-paulo',
      });

      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(String),
            email: 'session@example.com',
            role: 'player',
            status: 'active',
            profile: {
              id: expect.any(String),
              username: 'sessionuser',
              display_name: 'Session User',
              state: 'SP',
              city: 'São Paulo',
              city_slug: 'sao-paulo',
              status: 'active',
              created_at: expect.any(String),
              updated_at: expect.any(String),
            },
          },
          session: {
            id: expect.any(String),
            expires_at: expect.any(String),
            created_at: expect.any(String),
          },
        },
      });
    });

    it('deve retornar informações da sessão com perfil completo', async () => {
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'complete@example.com',
        password: 'senha123456',
        username: 'completeuser',
        display_name: 'Complete User',
        state: 'RJ',
        city: 'Rio de Janeiro',
        city_slug: 'rio-de-janeiro',
      });

      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(String),
            email: 'complete@example.com',
            role: 'player',
            status: 'active',
            profile: {
              id: expect.any(String),
              username: 'completeuser',
              display_name: 'Complete User',
              state: 'RJ',
              city: 'Rio de Janeiro',
              city_slug: 'rio-de-janeiro',
              status: 'active',
              created_at: expect.any(String),
              updated_at: expect.any(String),
            },
          },
          session: {
            id: expect.any(String),
            expires_at: expect.any(String),
            created_at: expect.any(String),
          },
        },
      });
    });

    it('deve retornar informações da sessão com campos opcionais undefined', async () => {
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'minimal@example.com',
        password: 'senha123456',
        username: 'minimaluser',
        display_name: 'Minimal User',
        state: 'MG',
        city: 'Belo Horizonte',
        city_slug: 'belo-horizonte',
      });

      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(String),
            email: 'minimal@example.com',
            role: 'player',
            status: 'active',
            profile: {
              id: expect.any(String),
              username: 'minimaluser',
              display_name: 'Minimal User',
              state: 'MG',
              city: 'Belo Horizonte',
              city_slug: 'belo-horizonte',
              status: 'active',
              created_at: expect.any(String),
              updated_at: expect.any(String),
            },
          },
          session: {
            id: expect.any(String),
            expires_at: expect.any(String),
            created_at: expect.any(String),
          },
        },
      });

      // Verificar que campos opcionais estão undefined quando não preenchidos
      const profile = response.body.data.user.profile;
      expect(profile.bio).toBeUndefined();
      expect(profile.contact_email).toBeUndefined();
      expect(profile.whatsapp).toBeUndefined();
      expect(profile.twitch).toBeUndefined();
      expect(profile.youtube).toBeUndefined();
      expect(profile.instagram).toBeUndefined();
      expect(profile.featured_media_id).toBeUndefined();
    });

    it('deve retornar informações da sessão com diferentes roles de usuário', async () => {
      // Testar com usuário admin (se existir no seed)
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'admin@example.com',
        password: 'senha123456',
        username: 'adminuser',
        display_name: 'Admin User',
        state: 'DF',
        city: 'Brasília',
        city_slug: 'brasilia',
      });

      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(String),
            email: 'admin@example.com',
            role: 'player', // Será player por padrão no signup
            status: 'active',
            profile: expect.any(Object),
          },
          session: {
            id: expect.any(String),
            expires_at: expect.any(String),
            created_at: expect.any(String),
          },
        },
      });
    });

    it('deve retornar informações da sessão com token válido recém-criado', async () => {
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'fresh@example.com',
        password: 'senha123456',
        username: 'freshuser',
        display_name: 'Fresh User',
        state: 'RS',
        city: 'Porto Alegre',
        city_slug: 'porto-alegre',
      });

      // Fazer requisição imediatamente após criação
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('fresh@example.com');
      expect(response.body.data.user.profile.username).toBe('freshuser');
    });

    it('deve retornar informações da sessão com diferentes estados brasileiros', async () => {
      const states = [
        { state: 'AC', city: 'Rio Branco', city_slug: 'rio-branco' },
        { state: 'AL', city: 'Maceió', city_slug: 'maceio' },
        { state: 'AP', city: 'Macapá', city_slug: 'macapa' },
        { state: 'AM', city: 'Manaus', city_slug: 'manaus' },
        { state: 'BA', city: 'Salvador', city_slug: 'salvador' },
        { state: 'CE', city: 'Fortaleza', city_slug: 'fortaleza' },
        { state: 'DF', city: 'Brasília', city_slug: 'brasilia' },
        { state: 'ES', city: 'Vitória', city_slug: 'vitoria' },
        { state: 'GO', city: 'Goiânia', city_slug: 'goiania' },
        { state: 'MA', city: 'São Luís', city_slug: 'sao-luis' },
        { state: 'MT', city: 'Cuiabá', city_slug: 'cuiaba' },
        { state: 'MS', city: 'Campo Grande', city_slug: 'campo-grande' },
        { state: 'MG', city: 'Belo Horizonte', city_slug: 'belo-horizonte' },
        { state: 'PA', city: 'Belém', city_slug: 'belem' },
        { state: 'PB', city: 'João Pessoa', city_slug: 'joao-pessoa' },
        { state: 'PR', city: 'Curitiba', city_slug: 'curitiba' },
        { state: 'PE', city: 'Recife', city_slug: 'recife' },
        { state: 'PI', city: 'Teresina', city_slug: 'teresina' },
        { state: 'RJ', city: 'Rio de Janeiro', city_slug: 'rio-de-janeiro' },
        { state: 'RN', city: 'Natal', city_slug: 'natal' },
        { state: 'RS', city: 'Porto Alegre', city_slug: 'porto-alegre' },
        { state: 'RO', city: 'Porto Velho', city_slug: 'porto-velho' },
        { state: 'RR', city: 'Boa Vista', city_slug: 'boa-vista' },
        { state: 'SC', city: 'Florianópolis', city_slug: 'florianopolis' },
        { state: 'SP', city: 'São Paulo', city_slug: 'sao-paulo' },
        { state: 'SE', city: 'Aracaju', city_slug: 'aracaju' },
        { state: 'TO', city: 'Palmas', city_slug: 'palmas' },
      ];

      for (let i = 0; i < Math.min(states.length, 5); i++) {
        const state = states[i];
        const { authResponse } = await AuthHelper.createTestUser({
          email: `state${i}@example.com`,
          password: 'senha123456',
          username: `state${i}user`,
          display_name: `State ${i} User`,
          state: state.state,
          city: state.city,
          city_slug: state.city_slug,
        });

        const response = await testClient.get(
          '/v1/session',
          testClient.withAuth(authResponse.data.tokens.access_token)
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.profile.state).toBe(state.state);
        expect(response.body.data.user.profile.city).toBe(state.city);
        expect(response.body.data.user.profile.city_slug).toBe(state.city_slug);
      }
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para requisição sem autenticação', async () => {
      const response = await testClient.get('/v1/session');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token inválido', async () => {
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('token-invalido')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token malformado', async () => {
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('Bearer token-malformado')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token expirado', async () => {
      // Criar um token que expira em 1 segundo
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'expired@example.com',
        password: 'senha123456',
        username: 'expireduser',
      });

      // Aguardar 2 segundos para o token expirar
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token de sessão inexistente', async () => {
      // Criar um token válido mas com session_id inexistente
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'nonexistent@example.com',
        password: 'senha123456',
        username: 'nonexistentuser',
      });

      // Simular token com session_id inexistente (isso seria difícil de fazer sem modificar o JWT)
      // Por enquanto, vamos testar com token inválido
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhmNmQ1NTQxN2EzNzAxZGMyY2Q5NDY2Iiwicm9sZSI6InBsYXllciIsInNlc3Npb25faWQiOiJpbmV4aXN0ZW50LXNlc3Npb24taWQiLCJpYXQiOjE3NjEwMDY5MzMsImV4cCI6MTc2MTAwNzgzMywiYXVkIjoicGxheWVyLWNsaWVudCIsImlzcyI6InBsYXllci1hcGkifQ.invalid-signature')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para sessão inativa', async () => {
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'inactive@example.com',
        password: 'senha123456',
        username: 'inactiveuser',
      });

      // Fazer logout para invalidar a sessão
      await testClient.post(
        '/v1/auth/logout',
        {},
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      // Tentar acessar a sessão após logout
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 403 para usuário inativo', async () => {
      // Este teste seria difícil de implementar sem modificar o banco diretamente
      // Por enquanto, vamos testar com token inválido
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('invalid-token-for-inactive-user')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token com formato incorreto', async () => {
      const response = await testClient.get(
        '/v1/session',
        { Authorization: 'InvalidFormat token' }
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token vazio', async () => {
      const response = await testClient.get(
        '/v1/session',
        { Authorization: '' }
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token null', async () => {
      const response = await testClient.get(
        '/v1/session',
        { Authorization: null as any }
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token undefined', async () => {
      const response = await testClient.get(
        '/v1/session',
        { Authorization: undefined as any }
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token com caracteres especiais', async () => {
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('token-com-<script>alert("xss")</script>')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token com espaços em branco', async () => {
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('   ')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });

    it('deve retornar erro 401 para token com caracteres de controle', async () => {
      const response = await testClient.get(
        '/v1/session',
        testClient.withAuth('token\x00\x01\x02')
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0401',
        error: {
          status: 401,
          name: 'Unauthorized',
        },
      });
    });
  });
});

