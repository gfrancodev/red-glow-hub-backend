import { describe, expect, it } from 'vitest';
import { AuthHelper, type TestUser } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('POST /v1/auth/signup', () => {
  describe('Casos Positivos', () => {
    it('deve criar um novo usuário com dados válidos', async () => {
      const timestamp = Date.now();
      const userData: TestUser = {
        email: `novo${timestamp}@example.com`,
        password: 'senha123456',
        username: `novousuario${timestamp}`,
        display_name: 'Novo Usuário',
        state: 'RJ',
        city: 'Rio de Janeiro',
        city_slug: 'rio-de-janeiro',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: expect.any(String),
            email: userData.email,
            role: 'player',
            status: 'active',
            profile: {
              id: expect.any(String),
              username: userData.username,
              display_name: userData.display_name,
              state: userData.state,
              city: userData.city,
              city_slug: userData.city_slug,
              status: 'active',
              created_at: expect.any(String),
              updated_at: expect.any(String),
            },
          },
          tokens: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
        },
      });
    });

    it('deve criar usuário sem city_slug (opcional)', async () => {
      const timestamp = Date.now();
      const userData: Omit<TestUser, 'city_slug'> = {
        email: `sem-slug${timestamp}@example.com`,
        password: 'senha123456',
        username: `semslug${timestamp}`,
        display_name: 'Sem Slug',
        state: 'MG',
        city: 'Belo Horizonte',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.profile.city_slug).toBeUndefined();
    });

    it('deve criar usuário com username contendo caracteres especiais permitidos', async () => {
      const timestamp = Date.now();
      const userData: TestUser = {
        email: `especial${timestamp}@example.com`,
        password: 'senha123456',
        username: `user_123-test${timestamp}`,
        display_name: 'Usuário Especial',
        state: 'RS',
        city: 'Porto Alegre',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.profile.username).toBe(`user_123-test${timestamp}`);
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 409 quando email já existe', async () => {
      const timestamp = Date.now();
      // Criar primeiro usuário
      await AuthHelper.createTestUser({
        email: `duplicado${timestamp}@example.com`,
        username: `usuario1${timestamp}`,
      });

      // Tentar criar segundo usuário com mesmo email
      const userData: TestUser = {
        email: `duplicado${timestamp}@example.com`,
        password: 'senha123456',
        username: `usuario2${timestamp}`,
        display_name: 'Segundo Usuário',
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0409',
        error: {
          status: 409,
          name: 'Conflict',
        },
      });
    });

    it('deve retornar erro 409 quando username já existe', async () => {
      const timestamp = Date.now();
      // Criar primeiro usuário
      await AuthHelper.createTestUser({
        email: `user1${timestamp}@example.com`,
        username: `usernameduplicado${timestamp}`,
      });

      // Tentar criar segundo usuário com mesmo username
      const userData: TestUser = {
        email: `user2${timestamp}@example.com`,
        password: 'senha123456',
        username: `usernameduplicado${timestamp}`,
        display_name: 'Segundo Usuário',
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0409',
        error: {
          status: 409,
          name: 'Conflict',
        },
      });
    });

    it('deve retornar erro 422 para email inválido', async () => {
      const userData = {
        email: 'email-invalido',
        password: 'senha123456',
        username: 'usuario',
        display_name: 'Usuário',
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });

    it('deve retornar erro 422 para senha muito curta', async () => {
      const userData = {
        email: 'teste@example.com',
        password: '123',
        username: 'usuario',
        display_name: 'Usuário',
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });

    it('deve retornar erro 422 para username muito curto', async () => {
      const userData = {
        email: 'teste@example.com',
        password: 'senha123456',
        username: 'ab',
        display_name: 'Usuário',
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });

    it('deve retornar erro 422 para username com caracteres inválidos', async () => {
      const userData = {
        email: 'teste@example.com',
        password: 'senha123456',
        username: 'user@invalid',
        display_name: 'Usuário',
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });

    it('deve retornar erro 422 para state com tamanho inválido', async () => {
      const userData = {
        email: 'teste@example.com',
        password: 'senha123456',
        username: 'usuario',
        display_name: 'Usuário',
        state: 'S',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });

    it('deve retornar erro 422 para campos obrigatórios ausentes', async () => {
      const userData = {
        email: 'teste@example.com',
        // password ausente
        username: 'usuario',
        // display_name ausente
        state: 'SP',
        city: 'São Paulo',
      };

      const response = await testClient.post('/v1/auth/signup', userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });

    it('deve retornar erro 422 para body vazio', async () => {
      const response = await testClient.post('/v1/auth/signup', {});

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0422',
        error: {
          status: 422,
          name: 'Unprocessable Entity',
        },
      });
    });
  });
});
