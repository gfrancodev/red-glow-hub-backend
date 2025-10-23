import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('GET /v1/me/profile', () => {
  let testUser: any;
  let testProfile: any;
  let accessToken: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const { user, profile, authResponse } = await AuthHelper.createTestUser({
      email: `profileget${timestamp}@example.com`,
      password: 'senha123456',
      username: `profileget${timestamp}`,
      display_name: 'Profile Get Test',
      state: 'SP',
      city: 'São Paulo',
    });

    testUser = user;
    testProfile = profile;
    accessToken = authResponse.data.tokens.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Casos Positivos', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      const response = await testClient.get('/v1/me/profile', testClient.withAuth(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testProfile.id,
          username: testUser.username,
          display_name: testUser.display_name,
          state: testUser.state,
          city: testUser.city,
          status: 'active',
        },
      });
    });

    it('deve incluir informações do usuário no perfil', async () => {
      const response = await testClient.get('/v1/me/profile', testClient.withAuth(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({
        id: expect.any(String),
        email: testUser.email,
        role: 'player',
        status: 'active',
      });
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para token ausente', async () => {
      const response = await testClient.get('/v1/me/profile');

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
        '/v1/me/profile',
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

    it('deve retornar erro 401 para token expirado', async () => {
      // Token expirado simulado
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhmMzE0YTIyZTYxMzg5MzVhOWU1YzhjIiwicm9sZSI6InBsYXllciIsInNlc3Npb25faWQiOiI2OGYzMTRhMjJlNjEzODkzNWE5ZTVjOGUiLCJpYXQiOjE3MzE4NjA5OTQsImV4cCI6MTczMTg2MTU5NH0.invalid';

      const response = await testClient.get('/v1/me/profile', testClient.withAuth(expiredToken));

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
