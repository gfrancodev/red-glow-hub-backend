import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('GET /v1/me/media', () => {
  let testUser: any;
  let testProfile: any;
  let accessToken: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const { user, profile, authResponse } = await AuthHelper.createTestUser({
      email: `profilemedia${timestamp}@example.com`,
      password: 'senha123456',
      username: `profilemedia${timestamp}`,
      display_name: 'Profile Media Test',
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
    it('deve retornar lista vazia quando não há mídia', async () => {
      const response = await testClient.get('/v1/me/media', testClient.withAuth(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: [],
      });
    });

    it('deve retornar mídia com filtros padrão', async () => {
      const response = await testClient.get('/v1/me/media', testClient.withAuth(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it('deve filtrar mídia por tipo', async () => {
      const response = await testClient.get(
        '/v1/me/media?type=image',
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it('deve filtrar mídia por status', async () => {
      const response = await testClient.get(
        '/v1/me/media?status=approved',
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it('deve limitar número de resultados', async () => {
      const response = await testClient.get(
        '/v1/me/media?limit=5',
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it('deve usar cursor para paginação', async () => {
      // Usar um ObjectId válido como cursor
      const validCursor = '507f1f77bcf86cd799439011';
      const response = await testClient.get(
        `/v1/me/media?cursor=${validCursor}`,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para token ausente', async () => {
      const response = await testClient.get('/v1/me/media');

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
      const response = await testClient.get('/v1/me/media', testClient.withAuth('token-invalido'));

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
