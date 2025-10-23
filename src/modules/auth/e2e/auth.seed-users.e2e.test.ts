import { describe, expect, it } from 'vitest';
import { AuthHelper, seedUsers } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('Usuários de Seed - Login', () => {
  describe('Casos Positivos', () => {
    it('deve fazer login com usuário admin do seed', async () => {
      const response = await testClient.post('/v1/auth/login', {
        email: seedUsers.admin.email,
        password: seedUsers.admin.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: seedUsers.admin.email,
            role: 'admin',
            status: 'active',
            profile: {
              username: seedUsers.admin.username,
              display_name: seedUsers.admin.display_name,
              state: seedUsers.admin.state,
              city: seedUsers.admin.city,
              city_slug: seedUsers.admin.city_slug,
              status: 'active',
            },
          },
          tokens: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
        },
      });
    });

    it('deve fazer login com usuário moderator do seed', async () => {
      const response = await testClient.post('/v1/auth/login', {
        email: seedUsers.moderator.email,
        password: seedUsers.moderator.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('moderator');
      expect(response.body.data.user.profile.username).toBe(seedUsers.moderator.username);
    });

    it('deve fazer login com usuário player do seed', async () => {
      const response = await testClient.post('/v1/auth/login', {
        email: seedUsers.player.email,
        password: seedUsers.player.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('player');
      expect(response.body.data.user.profile.username).toBe(seedUsers.player.username);
    });

    it('deve usar AuthHelper para login com usuário de seed', async () => {
      const authResponse = await AuthHelper.loginSeedUser('admin');

      expect(authResponse.success).toBe(true);
      expect(authResponse.data.user.role).toBe('admin');
      expect(authResponse.data.tokens.access_token).toBeDefined();
      expect(authResponse.data.tokens.refresh_token).toBeDefined();
    });

    it('deve obter access token de usuário de seed', async () => {
      const accessToken = await AuthHelper.getSeedUserToken('player');

      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
    });

    it('deve obter refresh token de usuário de seed', async () => {
      const refreshToken = await AuthHelper.getSeedUserRefreshToken('moderator');

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
    });

    it('deve obter par de tokens de usuário de seed', async () => {
      const tokens = await AuthHelper.getSeedUserTokenPair('admin');

      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();
      expect(typeof tokens.access_token).toBe('string');
      expect(typeof tokens.refresh_token).toBe('string');
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para usuário inativo do seed', async () => {
      const response = await testClient.post('/v1/auth/login', {
        email: seedUsers.inactive.email,
        password: seedUsers.inactive.password,
      });

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

    it('deve retornar erro 401 para senha incorreta de usuário de seed', async () => {
      const response = await testClient.post('/v1/auth/login', {
        email: seedUsers.admin.email,
        password: 'senha_incorreta',
      });

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

    it('deve retornar erro 401 para email inexistente', async () => {
      const response = await testClient.post('/v1/auth/login', {
        email: 'inexistente@test.com',
        password: 'qualquer_senha',
      });

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

  describe('Testes de Autorização', () => {
    it('deve permitir logout com token de admin', async () => {
      const accessToken = await AuthHelper.getSeedUserToken('admin');

      const response = await testClient.post(
        '/v1/auth/logout',
        {},
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve permitir logout com token de moderator', async () => {
      const accessToken = await AuthHelper.getSeedUserToken('moderator');

      const response = await testClient.post(
        '/v1/auth/logout',
        {},
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve permitir logout com token de player', async () => {
      const accessToken = await AuthHelper.getSeedUserToken('player');

      const response = await testClient.post(
        '/v1/auth/logout',
        {},
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve permitir refresh token com usuário de seed', async () => {
      const refreshToken = await AuthHelper.getSeedUserRefreshToken('player');

      const response = await testClient.post('/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();
    });
  });
});
