import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { ImageHelper } from '../../../../test/utils/image-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('PATCH /v1/me/media/:media_id', () => {
  let testUser: any;
  let testProfile: any;
  let testMedia: any;
  let accessToken: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const { user, profile, authResponse } = await AuthHelper.createTestUser({
      email: `profilemediaupdate${timestamp}@example.com`,
      password: 'senha123456',
      username: `pmu${timestamp}`, // Username mais curto
      display_name: 'Profile Media Update Test',
      state: 'SP',
      city: 'São Paulo',
    });

    testUser = user;
    testProfile = profile;
    accessToken = authResponse.data.tokens.access_token;

    // Criar uma mídia de teste para atualizar
    const mediaData = await ImageHelper.generateMediaData('image', {
      title: 'Imagem Original',
      tags: ['original'],
      width: 800,
      height: 600,
    });

    const createResponse = await testClient.post(
      '/v1/me/media',
      mediaData,
      testClient.withAuth(accessToken)
    );

    testMedia = createResponse.body.data;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Casos Positivos', () => {
    it('deve atualizar mídia com dados válidos', async () => {
      const updateData = {
        title: 'Título Atualizado',
        focal_point_x: 25,
        focal_point_y: 75,
        tags: ['atualizado', 'teste'],
      };

      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        updateData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testMedia.id,
          title: updateData.title,
          focal_point_x: updateData.focal_point_x,
          focal_point_y: updateData.focal_point_y,
          tags_cache: updateData.tags,
        },
      });
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const updateData = {
        title: 'Apenas Título',
      };

      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        updateData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        title: updateData.title,
        // Outros campos devem permanecer inalterados
        focal_point_x: 25, // do teste anterior
        focal_point_y: 75, // do teste anterior
      });
    });

    it('deve permitir atualizar com campos opcionais vazios', async () => {
      const updateData = {
        title: '',
        tags: [],
      };

      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        updateData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        title: '',
        tags_cache: [],
      });
    });

    it('deve permitir atualizar com body vazio', async () => {
      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        {},
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testMedia.id,
        },
      });
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para token ausente', async () => {
      const response = await testClient.patch(`/v1/me/media/${testMedia.id}`, {
        title: 'Teste',
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

    it('deve retornar erro 401 para token inválido', async () => {
      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        { title: 'Teste' },
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

    it('deve retornar erro 404 para media_id inexistente', async () => {
      const fakeMediaId = '507f1f77bcf86cd799439011'; // ObjectId válido mas inexistente
      const response = await testClient.patch(
        `/v1/me/media/${fakeMediaId}`,
        { title: 'Teste' },
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0404',
        error: {
          status: 404,
          name: 'Not Found',
        },
      });
    });

    it('deve retornar erro 404 para media_id de outro usuário', async () => {
      // Criar outro usuário e sua mídia
      const timestamp = Date.now();
      const { authResponse: otherAuthResponse } = await AuthHelper.createTestUser({
        email: `otheruser${timestamp}@example.com`,
        password: 'senha123456',
        username: `otheruser${timestamp}`,
        display_name: 'Other User',
        state: 'RJ',
        city: 'Rio de Janeiro',
      });

      const otherMediaData = await ImageHelper.generateMediaData('image', {
        width: 600,
        height: 400,
      });

      const otherMediaResponse = await testClient.post(
        '/v1/me/media',
        otherMediaData,
        testClient.withAuth(otherAuthResponse.data.tokens.access_token)
      );

      const otherMediaId = otherMediaResponse.body.data.id;

      // Tentar atualizar mídia de outro usuário
      const response = await testClient.patch(
        `/v1/me/media/${otherMediaId}`,
        { title: 'Tentativa de Hack' },
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0404',
        error: {
          status: 404,
          name: 'Not Found',
        },
      });
    });

    it('deve retornar erro 422 para title muito longo', async () => {
      const updateData = {
        title: 'A'.repeat(201), // Máximo é 200
      };

      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        updateData,
        testClient.withAuth(accessToken)
      );

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

    it('deve retornar erro 422 para focal_point_x fora do range', async () => {
      const updateData = {
        focal_point_x: 150, // Deve estar entre 0 e 100
      };

      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        updateData,
        testClient.withAuth(accessToken)
      );

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

    it('deve retornar erro 422 para focal_point_y fora do range', async () => {
      const updateData = {
        focal_point_y: -10, // Deve estar entre 0 e 100
      };

      const response = await testClient.patch(
        `/v1/me/media/${testMedia.id}`,
        updateData,
        testClient.withAuth(accessToken)
      );

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

    it('deve retornar erro 422 para media_id inválido', async () => {
      const response = await testClient.patch(
        '/v1/me/media/id-invalido',
        { title: 'Teste' },
        testClient.withAuth(accessToken)
      );

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
