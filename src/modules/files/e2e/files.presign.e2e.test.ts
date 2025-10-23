import { describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('POST /v1/files/presign', () => {
  describe('Casos Positivos', () => {
    it('deve gerar URL pré-assinada para upload de imagem de mídia', async () => {
      const { authResponse } = await AuthHelper.createTestUser({
        email: 'files@example.com',
        password: 'senha123456',
        username: 'filesuser',
      });

      const presignData = {
        file_name: 'test-image.jpg',
        content_type: 'image/jpeg',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          upload_url: expect.any(String),
          file_key: expect.any(String),
          public_url: expect.any(String),
          expires_in: 3600,
        },
      });

      // Verificar se a URL contém informações corretas
      expect(response.body.data.upload_url).toContain('X-Amz-Algorithm');
      expect(response.body.data.file_key).toContain('media/');
      expect(response.body.data.file_key).toContain('test-image.jpg');
      expect(response.body.data.public_url).toContain('media/');
    });

    it('deve gerar URL pré-assinada para upload de vídeo de mídia', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `files${timestamp}@example.com`,
        password: 'senha123456',
        username: `files${timestamp}`,
      });

      const presignData = {
        file_name: 'test-video.mp4',
        content_type: 'video/mp4',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          upload_url: expect.any(String),
          file_key: expect.any(String),
          public_url: expect.any(String),
          expires_in: 3600,
        },
      });

      expect(response.body.data.file_key).toContain('media/');
      expect(response.body.data.file_key).toContain('test-video.mp4');
    });

    it('deve gerar URL pré-assinada para upload de avatar', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `avatar${timestamp}@example.com`,
        password: 'senha123456',
        username: `avatar${timestamp}`,
      });

      const presignData = {
        file_name: 'avatar.png',
        content_type: 'image/png',
        kind: 'avatar',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          upload_url: expect.any(String),
          file_key: expect.any(String),
          public_url: expect.any(String),
          expires_in: 3600,
        },
      });

      expect(response.body.data.file_key).toContain('avatar/');
      expect(response.body.data.file_key).toContain('avatar.png');
    });

    it('deve gerar URL pré-assinada para upload de banner', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `banner${timestamp}@example.com`,
        password: 'senha123456',
        username: `banner${timestamp}`,
      });

      const presignData = {
        file_name: 'banner.webp',
        content_type: 'image/webp',
        kind: 'banner',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          upload_url: expect.any(String),
          file_key: expect.any(String),
          public_url: expect.any(String),
          expires_in: 3600,
        },
      });

      expect(response.body.data.file_key).toContain('banner/');
      expect(response.body.data.file_key).toContain('banner.webp');
    });

    it('deve gerar URL pré-assinada para diferentes tipos de imagem', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `images${timestamp}@example.com`,
        password: 'senha123456',
        username: `images${timestamp}`,
      });

      const imageTypes = [
        { file_name: 'image1.jpg', content_type: 'image/jpeg' },
        { file_name: 'image2.png', content_type: 'image/png' },
        { file_name: 'image3.webp', content_type: 'image/webp' },
      ];

      for (const imageType of imageTypes) {
        const presignData = {
          ...imageType,
          kind: 'media',
        };

        const response = await testClient.post(
          '/v1/files/presign',
          presignData,
          testClient.withAuth(authResponse.data.tokens.access_token)
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.file_key).toContain('media/');
        expect(response.body.data.file_key).toContain(imageType.file_name);
      }
    });

    it('deve gerar URL pré-assinada para diferentes tipos de vídeo', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `videos${timestamp}@example.com`,
        password: 'senha123456',
        username: `videos${timestamp}`,
      });

      const videoTypes = [
        { file_name: 'video1.mp4', content_type: 'video/mp4' },
        { file_name: 'video2.webm', content_type: 'video/webm' },
      ];

      for (const videoType of videoTypes) {
        const presignData = {
          ...videoType,
          kind: 'media',
        };

        const response = await testClient.post(
          '/v1/files/presign',
          presignData,
          testClient.withAuth(authResponse.data.tokens.access_token)
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.file_key).toContain('media/');
        expect(response.body.data.file_key).toContain(videoType.file_name);
      }
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para requisição sem autenticação', async () => {
      const presignData = {
        file_name: 'test.jpg',
        content_type: 'image/jpeg',
        kind: 'media',
      };

      const response = await testClient.post('/v1/files/presign', presignData);

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
      const presignData = {
        file_name: 'test.jpg',
        content_type: 'image/jpeg',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
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

    it('deve retornar erro 422 para content_type inválido para mídia', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `invalid${timestamp}@example.com`,
        password: 'senha123456',
        username: `invalid${timestamp}`,
      });

      const presignData = {
        file_name: 'test.txt',
        content_type: 'text/plain',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
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

    it('deve retornar erro 400 para content_type inválido para avatar', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `avatarinvalid${timestamp}@example.com`,
        password: 'senha123456',
        username: `avatarinvalid${timestamp}`,
      });

      const presignData = {
        file_name: 'test.mp4',
        content_type: 'video/mp4',
        kind: 'avatar',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
      );

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0400',
        error: {
          status: 400,
          name: 'Bad Request',
        },
      });
    });

    it('deve retornar erro 422 para file_name vazio', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `empty${timestamp}@example.com`,
        password: 'senha123456',
        username: `empty${timestamp}`,
      });

      const presignData = {
        file_name: '',
        content_type: 'image/jpeg',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
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

    it('deve retornar erro 422 para file_name muito longo', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `long${timestamp}@example.com`,
        password: 'senha123456',
        username: `long${timestamp}`,
      });

      const longFileName = 'a'.repeat(256); // 256 caracteres (acima do limite de 255)

      const presignData = {
        file_name: longFileName,
        content_type: 'image/jpeg',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
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

    it('deve retornar erro 422 para content_type inválido', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `content${timestamp}@example.com`,
        password: 'senha123456',
        username: `content${timestamp}`,
      });

      const presignData = {
        file_name: 'test.jpg',
        content_type: 'invalid/type',
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
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

    it('deve retornar erro 422 para kind inválido', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `kind${timestamp}@example.com`,
        password: 'senha123456',
        username: `kind${timestamp}`,
      });

      const presignData = {
        file_name: 'test.jpg',
        content_type: 'image/jpeg',
        kind: 'invalid',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
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
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `missing${timestamp}@example.com`,
        password: 'senha123456',
        username: `missing${timestamp}`,
      });

      const presignData = {
        file_name: 'test.jpg',
        // content_type ausente
        kind: 'media',
      };

      const response = await testClient.post(
        '/v1/files/presign',
        presignData,
        testClient.withAuth(authResponse.data.tokens.access_token)
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

    it('deve retornar erro 422 para body vazio', async () => {
      const timestamp = Date.now();
      const { authResponse } = await AuthHelper.createTestUser({
        email: `emptybody${timestamp}@example.com`,
        password: 'senha123456',
        username: `emptybody${timestamp}`,
      });

      const response = await testClient.post(
        '/v1/files/presign',
        {},
        testClient.withAuth(authResponse.data.tokens.access_token)
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
