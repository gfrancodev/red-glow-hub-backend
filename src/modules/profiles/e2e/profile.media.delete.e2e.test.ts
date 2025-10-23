import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { ImageHelper } from '../../../../test/utils/image-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('DELETE /v1/me/media/:media_id', () => {
  let testUser: any;
  let testProfile: any;
  let testMedia: any;
  let accessToken: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const { user, profile, authResponse } = await AuthHelper.createTestUser({
      email: `profilemediadelete${timestamp}@example.com`,
      password: 'senha123456',
      username: `pmd${timestamp}`, // Username mais curto
      display_name: 'Profile Media Delete Test',
      state: 'SP',
      city: 'São Paulo',
    });

    testUser = user;
    testProfile = profile;
    accessToken = authResponse.data.tokens.access_token;

    // Criar uma mídia de teste para deletar
    const mediaData = await ImageHelper.generateMediaData('image', {
      title: 'Imagem para Deletar',
      tags: ['delete', 'teste'],
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
    it('deve deletar mídia existente', async () => {
      // Criar uma nova mídia para deletar (já que a anterior pode ter sido deletada)
      const mediaData = await ImageHelper.generateMediaData('image', {
        title: 'Imagem para Deletar Test',
        tags: ['delete', 'test'],
        width: 800,
        height: 600,
      });

      const createResponse = await testClient.post(
        '/v1/me/media',
        mediaData,
        testClient.withAuth(accessToken)
      );

      const mediaToDelete = createResponse.body.data;

      const response = await testClient.delete(
        `/v1/me/media/${mediaToDelete.id}`,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
      });
    });

    it('deve retornar erro 404 ao tentar deletar mídia já deletada', async () => {
      // Criar nova mídia para deletar
      const mediaData = await ImageHelper.generateMediaData('image', {
        title: 'Imagem para Deletar 2',
        width: 600,
        height: 400,
      });

      const createResponse = await testClient.post(
        '/v1/me/media',
        mediaData,
        testClient.withAuth(accessToken)
      );

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toBeDefined();
      expect(createResponse.body.data.id).toBeDefined();

      const mediaToDelete = createResponse.body.data;

      // Deletar a mídia
      await testClient.delete(`/v1/me/media/${mediaToDelete.id}`, testClient.withAuth(accessToken));

      // Tentar deletar novamente
      const response = await testClient.delete(
        `/v1/me/media/${mediaToDelete.id}`,
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
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para token ausente', async () => {
      const response = await testClient.delete(`/v1/me/media/${testMedia.id}`);

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
      const response = await testClient.delete(
        `/v1/me/media/${testMedia.id}`,
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
      const response = await testClient.delete(
        `/v1/me/media/${fakeMediaId}`,
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
        email: `otheruserdelete${timestamp}@example.com`,
        password: 'senha123456',
        username: `otheruserdelete${timestamp}`,
        display_name: 'Other User Delete',
        state: 'RJ',
        city: 'Rio de Janeiro',
      });

      const otherMediaData = await ImageHelper.generateMediaData('image', {
        width: 500,
        height: 300,
      });

      const otherMediaResponse = await testClient.post(
        '/v1/me/media',
        otherMediaData,
        testClient.withAuth(otherAuthResponse.data.tokens.access_token)
      );

      const otherMediaId = otherMediaResponse.body.data.id;

      // Tentar deletar mídia de outro usuário
      const response = await testClient.delete(
        `/v1/me/media/${otherMediaId}`,
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

    it('deve retornar erro 422 para media_id inválido', async () => {
      const response = await testClient.delete(
        '/v1/me/media/id-invalido',
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
