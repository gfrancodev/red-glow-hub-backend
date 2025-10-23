import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { ImageHelper } from '../../../../test/utils/image-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('POST /v1/me/media', () => {
  let accessToken: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const { authResponse } = await AuthHelper.createTestUser({
      email: `profilemediacreate${timestamp}@example.com`,
      password: 'senha123456',
      username: `pmc${timestamp}`, // Username mais curto
      display_name: 'Profile Media Create Test',
      state: 'SP',
      city: 'São Paulo',
    });

    accessToken = authResponse.data.tokens.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Casos Positivos', () => {
    it('deve criar mídia de imagem com dados válidos', async () => {
      const mediaData = await ImageHelper.generateMediaData('image', {
        title: 'Imagem de teste real',
        tags: ['teste', 'imagem'],
        width: 800,
        height: 600,
      });

      // Adicionar campos extras
      mediaData.focal_point_x = 50;
      mediaData.focal_point_y = 50;
      mediaData.blur_data_url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          type: mediaData.type,
          source: mediaData.source,
          url: mediaData.url,
          poster_url: mediaData.poster_url,
          blur_data_url: mediaData.blur_data_url,
          width: mediaData.width,
          height: mediaData.height,
          focal_point_x: mediaData.focal_point_x,
          focal_point_y: mediaData.focal_point_y,
          title: mediaData.title,
          tags_cache: mediaData.tags,
          status: 'pending',
        },
      });
    });

    it('deve criar mídia de vídeo com dados válidos', async () => {
      const mediaData = await ImageHelper.generateMediaData('video', {
        title: 'Vídeo de teste real',
        tags: ['teste', 'video'],
        width: 1280,
        height: 720,
      });

      // Adicionar campos extras
      mediaData.focal_point_x = 30;
      mediaData.focal_point_y = 70;

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          type: mediaData.type,
          source: mediaData.source,
          url: mediaData.url,
          poster_url: mediaData.poster_url,
          width: mediaData.width,
          height: mediaData.height,
          duration_sec: mediaData.duration_sec,
          focal_point_x: mediaData.focal_point_x,
          focal_point_y: mediaData.focal_point_y,
          title: mediaData.title,
          tags_cache: mediaData.tags,
          status: 'pending',
        },
      });
    });

    it('deve criar mídia com campos opcionais ausentes', async () => {
      const mediaData = await ImageHelper.generateMediaData('image', {
        width: 400,
        height: 300,
      });

      // Remover campos opcionais para testar
      const mediaDataWithoutOptionals = {
        type: mediaData.type,
        source: mediaData.source,
        url: mediaData.url,
        width: mediaData.width,
        height: mediaData.height,
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaDataWithoutOptionals,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          type: mediaData.type,
          source: mediaData.source,
          url: mediaData.url,
          status: 'pending',
        },
      });
    });

    it('deve usar source padrão quando não fornecido', async () => {
      const mediaData = await ImageHelper.generateMediaData('image', {
        width: 600,
        height: 400,
      });

      // Remover source para testar valor padrão
      const mediaDataWithoutSource = {
        type: mediaData.type,
        url: mediaData.url,
        width: mediaData.width,
        height: mediaData.height,
        title: mediaData.title,
        tags: mediaData.tags,
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaDataWithoutSource,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(201);
      expect(response.body.data.source).toBe('upload'); // Valor padrão
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para token ausente', async () => {
      const response = await testClient.post('/v1/me/media', {
        type: 'image',
        url: 'https://example.com/image.jpg',
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

    it('deve retornar erro 422 para type inválido', async () => {
      const mediaData = {
        type: 'audio', // Tipo inválido
        url: 'https://example.com/audio.mp3',
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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

    it('deve retornar erro 422 para source inválido', async () => {
      const mediaData = {
        type: 'image',
        source: 'invalid', // Source inválido
        url: 'https://example.com/image.jpg',
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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

    it('deve retornar erro 422 para URL inválida', async () => {
      const mediaData = {
        type: 'image',
        url: 'url-invalida',
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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

    it('deve retornar erro 422 para poster_url inválida', async () => {
      const mediaData = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        poster_url: 'url-invalida',
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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
      const mediaData = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        focal_point_x: 150, // Deve estar entre 0 e 100
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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
      const mediaData = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        focal_point_y: -10, // Deve estar entre 0 e 100
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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

    it('deve retornar erro 422 para title muito longo', async () => {
      const mediaData = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        title: 'A'.repeat(201), // Máximo é 200
      };

      const response = await testClient.post(
        '/v1/me/media',
        mediaData,
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

    it('deve retornar erro 422 para campos obrigatórios ausentes', async () => {
      const response = await testClient.post('/v1/me/media', {}, testClient.withAuth(accessToken));

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
