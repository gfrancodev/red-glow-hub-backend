import { beforeEach, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { ImageHelper } from '../../../../test/utils/image-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('POST /v1/uploads/callback', () => {
  let testMediaId: string;

  beforeEach(async () => {
    // Criar usuário de teste
    const timestamp = Date.now();
    const { authResponse } = await AuthHelper.createTestUser({
      email: `upload${timestamp}@example.com`,
      password: 'senha123456',
      username: `uploaduser${timestamp}`,
    });

    // Criar mídia de teste
    const mediaData = await ImageHelper.generateMediaData('image', {
      title: 'Imagem para Callback Test',
      tags: ['callback', 'test'],
      width: 800,
      height: 600,
    });

    const createResponse = await testClient.post(
      '/v1/me/media',
      mediaData,
      testClient.withAuth(authResponse.data.tokens.access_token)
    );

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data).toBeDefined();
    expect(createResponse.body.data.id).toBeDefined();

    testMediaId = createResponse.body.data.id;
  });

  describe('Casos Positivos', () => {
    it('deve processar callback de aprovação com sucesso', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media-123.jpg',
          file_size: 1024000,
          width: 1920,
          height: 1080,
          duration: 30,
          nsfw_score: 0.1,
          nsfw_labels: ['safe'],
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          media_id: testMediaId,
          status: 'approved',
          updated_at: expect.any(String),
        },
      });
    });

    it('deve processar callback de rejeição com sucesso', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'rejected',
        metadata: {
          file_key: 'uploads/media-456.jpg',
          file_size: 2048000,
          width: 1280,
          height: 720,
          duration: 60,
          nsfw_score: 0.9,
          nsfw_labels: ['explicit', 'adult'],
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          media_id: testMediaId,
          status: 'rejected',
          updated_at: expect.any(String),
        },
      });
    });

    it('deve processar callback com metadados mínimos', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media-minimal.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          media_id: testMediaId,
          status: 'approved',
          updated_at: expect.any(String),
        },
      });
    });

    it('deve processar callback com metadados completos', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media-complete.mp4',
          file_size: 5242880,
          width: 3840,
          height: 2160,
          duration: 120,
          nsfw_score: 0.05,
          nsfw_labels: ['safe', 'family-friendly'],
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          media_id: testMediaId,
          status: 'approved',
          updated_at: expect.any(String),
        },
      });
    });

    it('deve processar callback com diferentes tipos de arquivo', async () => {
      const fileTypes = [
        { file_key: 'uploads/image.jpg', width: 1920, height: 1080, duration: undefined },
        { file_key: 'uploads/video.mp4', width: 1280, height: 720, duration: 45 },
        { file_key: 'uploads/audio.mp3', width: undefined, height: undefined, duration: 180 },
        { file_key: 'uploads/document.pdf', width: undefined, height: undefined, duration: undefined },
      ];

      for (let i = 0; i < fileTypes.length; i++) {
        const fileType = fileTypes[i];
        const callbackData = {
          media_id: testMediaId,
          status: 'approved',
          metadata: {
            file_key: fileType.file_key,
            file_size: 1024000,
            width: fileType.width,
            height: fileType.height,
            duration: fileType.duration,
            nsfw_score: 0.1,
            nsfw_labels: ['safe'],
          },
        };

        const response = await testClient.post('/v1/uploads/callback', callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.media_id).toBe(testMediaId);
      }
    });

    it('deve processar callback com diferentes scores NSFW', async () => {
      const nsfwScores = [0.0, 0.1, 0.5, 0.8, 0.9, 1.0];

      for (const score of nsfwScores) {
        const callbackData = {
          media_id: testMediaId,
          status: score > 0.7 ? 'rejected' : 'approved',
          metadata: {
            file_key: `uploads/media-${score}.jpg`,
            file_size: 1024000,
            width: 1920,
            height: 1080,
            nsfw_score: score,
            nsfw_labels: score > 0.7 ? ['explicit'] : ['safe'],
          },
        };

        const response = await testClient.post('/v1/uploads/callback', callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.media_id).toBe(testMediaId);
      }
    });

    it('deve processar callback com diferentes labels NSFW', async () => {
      const nsfwLabels = [
        ['safe'],
        ['safe', 'family-friendly'],
        ['mild'],
        ['adult'],
        ['explicit'],
        ['explicit', 'adult', 'nsfw'],
      ];

      for (let i = 0; i < nsfwLabels.length; i++) {
        const labels = nsfwLabels[i];
        const callbackData = {
          media_id: testMediaId,
          status: labels.includes('explicit') ? 'rejected' : 'approved',
          metadata: {
            file_key: `uploads/media-${i}.jpg`,
            file_size: 1024000,
            width: 1920,
            height: 1080,
            nsfw_score: labels.includes('explicit') ? 0.9 : 0.1,
            nsfw_labels: labels,
          },
        };

        const response = await testClient.post('/v1/uploads/callback', callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.media_id).toBe(testMediaId);
      }
    });

    it('deve processar callback com diferentes tamanhos de arquivo', async () => {
      const fileSizes = [1024, 1024000, 10485760, 104857600, 1073741824]; // 1KB, 1MB, 10MB, 100MB, 1GB

      for (const size of fileSizes) {
        const callbackData = {
          media_id: testMediaId,
          status: 'approved',
          metadata: {
            file_key: `uploads/media-${size}.jpg`,
            file_size: size,
            width: 1920,
            height: 1080,
            nsfw_score: 0.1,
            nsfw_labels: ['safe'],
          },
        };

        const response = await testClient.post('/v1/uploads/callback', callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.media_id).toBe(testMediaId);
      }
    });

    it('deve processar callback com diferentes resoluções', async () => {
      const resolutions = [
        { width: 640, height: 480 },
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
        { width: 3840, height: 2160 },
      ];

      for (const res of resolutions) {
        const callbackData = {
          media_id: testMediaId,
          status: 'approved',
          metadata: {
            file_key: `uploads/media-${res.width}x${res.height}.jpg`,
            file_size: 1024000,
            width: res.width,
            height: res.height,
            nsfw_score: 0.1,
            nsfw_labels: ['safe'],
          },
        };

        const response = await testClient.post('/v1/uploads/callback', callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.media_id).toBe(testMediaId);
      }
    });

    it('deve processar callback com diferentes durações', async () => {
      const durations = [0, 1, 30, 60, 300, 3600]; // 0s, 1s, 30s, 1min, 5min, 1h

      for (const duration of durations) {
        const callbackData = {
          media_id: testMediaId,
          status: 'approved',
          metadata: {
            file_key: `uploads/media-${duration}s.mp4`,
            file_size: 1024000,
            width: 1920,
            height: 1080,
            duration: duration,
            nsfw_score: 0.1,
            nsfw_labels: ['safe'],
          },
        };

        const response = await testClient.post('/v1/uploads/callback', callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.media_id).toBe(testMediaId);
      }
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 400 para media_id vazio', async () => {
      const callbackData = {
        media_id: '',
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para media_id ausente', async () => {
      const callbackData = {
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para status inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'invalid_status',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para status ausente', async () => {
      const callbackData = {
        media_id: testMediaId,
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para metadata ausente', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para file_key ausente', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_size: 1024000,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 422 para file_key vazio', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: '',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para file_size inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          file_size: 'invalid_size',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para width inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          width: 'invalid_width',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para height inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          height: 'invalid_height',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para duration inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.mp4',
          duration: 'invalid_duration',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para nsfw_score inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          nsfw_score: 'invalid_score',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para nsfw_labels inválido', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          nsfw_labels: 'invalid_labels',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para nsfw_labels com elementos inválidos', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          nsfw_labels: [123, true, null],
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para body vazio', async () => {
      const response = await testClient.post('/v1/uploads/callback', {});

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

    it('deve retornar erro 500 para body null', async () => {
      const response = await testClient.post('/v1/uploads/callback', null);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0500',
        error: {
          status: 500,
          name: 'Internal Server Error',
        },
      });
    });

    it('deve retornar erro 400 para body undefined', async () => {
      const response = await testClient.post('/v1/uploads/callback', undefined);

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

    it('deve processar callback com campos extras (ignorados)', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
        extra_field: 'should_be_ignored',
        another_field: 123,
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          media_id: testMediaId,
          status: 'approved',
        },
      });
    });

    it('deve retornar erro 400 para valores null', async () => {
      const callbackData = {
        media_id: null,
        status: null,
        metadata: null,
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para valores undefined', async () => {
      const callbackData = {
        media_id: undefined,
        status: undefined,
        metadata: undefined,
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para valores booleanos inválidos', async () => {
      const callbackData = {
        media_id: true,
        status: false,
        metadata: true,
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para valores de array inválidos', async () => {
      const callbackData = {
        media_id: ['invalid'],
        status: ['invalid'],
        metadata: ['invalid'],
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 400 para valores de objeto inválidos', async () => {
      const callbackData = {
        media_id: { invalid: 'object' },
        status: { invalid: 'object' },
        metadata: { invalid: 'object' },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

    it('deve retornar erro 500 para valores com caracteres especiais', async () => {
      const callbackData = {
        media_id: '<script>alert("xss")</script>',
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0500',
        error: {
          status: 500,
          name: 'Internal Server Error',
        },
      });
    });

    it('deve retornar erro 500 para valores com emojis', async () => {
      const callbackData = {
        media_id: '🚀😀🎉',
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0500',
        error: {
          status: 500,
          name: 'Internal Server Error',
        },
      });
    });

    it('deve retornar erro 500 para valores com caracteres unicode', async () => {
      const callbackData = {
        media_id: 'αβγδε-中文-العربية',
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0500',
        error: {
          status: 500,
          name: 'Internal Server Error',
        },
      });
    });

    it('deve retornar erro 500 para valores com caracteres de controle', async () => {
      const callbackData = {
        media_id: 'media\x00\x01\x02',
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0500',
        error: {
          status: 500,
          name: 'Internal Server Error',
        },
      });
    });

    it('deve retornar erro 500 para valores muito longos', async () => {
      const longValue = 'a'.repeat(1000);
      const callbackData = {
        media_id: longValue,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        code: 'PL-0500',
        error: {
          status: 500,
          name: 'Internal Server Error',
        },
      });
    });

    it('deve retornar erro 400 para valores vazios', async () => {
      const callbackData = {
        media_id: '   ',
        status: '   ',
        metadata: {
          file_key: '   ',
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

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

  describe('Testes de Validação de Tipos', () => {
    it('deve aceitar file_size como número inteiro', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          file_size: 1024000,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar file_size como número decimal', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          file_size: 1024.5,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar width como número inteiro', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          width: 1920,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar height como número inteiro', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          height: 1080,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar duration como número inteiro', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.mp4',
          duration: 30,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar duration como número decimal', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.mp4',
          duration: 30.5,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar nsfw_score como número decimal', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          nsfw_score: 0.5,
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar nsfw_labels como array de strings', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          nsfw_labels: ['safe', 'family-friendly'],
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve aceitar nsfw_labels como array vazio', async () => {
      const callbackData = {
        media_id: testMediaId,
        status: 'approved',
        metadata: {
          file_key: 'uploads/media.jpg',
          nsfw_labels: [],
        },
      };

      const response = await testClient.post('/v1/uploads/callback', callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});


