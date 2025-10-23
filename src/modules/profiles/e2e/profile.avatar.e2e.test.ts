import { beforeEach, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('POST /v1/me/avatar - Avatar Upload Tests', () => {
  let accessToken: string;

  beforeEach(async () => {
    // Criar usuário de teste
    const timestamp = Date.now();
    const { authResponse } = await AuthHelper.createTestUser({
      email: `avatar${timestamp}@example.com`,
      password: 'senha123456',
      username: `avataruser${timestamp}`,
    });
    accessToken = authResponse.data.tokens.access_token;
  });

  describe('POST /v1/me/avatar/upload', () => {
    it('deve gerar URL pré-assinada para upload de avatar válido', async () => {
      const uploadData = {
        file_name: 'avatar.jpg',
        content_type: 'image/jpeg',
      };

      const response = await testClient.post(
        '/v1/me/avatar/upload',
        uploadData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.upload_url).toBeDefined();
      expect(response.body.data.key).toBeDefined();
      expect(response.body.data.public_url).toBeDefined();
      expect(response.body.data.key).toContain('avatars/');
    });

    it('deve gerar URL pré-assinada para diferentes formatos de imagem', async () => {
      const formats = [
        { file_name: 'avatar.png', content_type: 'image/png' },
        { file_name: 'avatar.gif', content_type: 'image/gif' },
        { file_name: 'avatar.webp', content_type: 'image/webp' },
      ];

      for (const format of formats) {
        const response = await testClient.post(
          '/v1/me/avatar/upload',
          format,
          testClient.withAuth(accessToken)
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.upload_url).toBeDefined();
        expect(response.body.data.key).toContain('avatars/');
      }
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      const uploadData = {
        file_name: 'avatar.jpg',
        content_type: 'image/jpeg',
      };

      const response = await testClient.post('/v1/me/avatar/upload', uploadData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 422 para dados inválidos', async () => {
      const invalidData = {
        file_name: '',
        content_type: 'text/plain',
      };

      const response = await testClient.post(
        '/v1/me/avatar/upload',
        invalidData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details.issues).toBeDefined();
    });

    it('deve retornar erro 422 para content_type inválido', async () => {
      const invalidData = {
        file_name: 'avatar.txt',
        content_type: 'text/plain',
      };

      const response = await testClient.post(
        '/v1/me/avatar/upload',
        invalidData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details.issues).toBeDefined();
    });

    it('deve retornar erro 422 para file_name muito longo', async () => {
      const invalidData = {
        file_name: 'a'.repeat(256), // Muito longo
        content_type: 'image/jpeg',
      };

      const response = await testClient.post(
        '/v1/me/avatar/upload',
        invalidData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details.issues).toBeDefined();
    });
  });

  describe('POST /v1/me/avatar/confirm', () => {
    it('deve confirmar upload de avatar com key válida', async () => {
      // Primeiro, obter uma key válida
      const uploadData = {
        file_name: 'avatar.jpg',
        content_type: 'image/jpeg',
      };

      const uploadResponse = await testClient.post(
        '/v1/me/avatar/upload',
        uploadData,
        testClient.withAuth(accessToken)
      );

      expect(uploadResponse.status).toBe(200);
      const { key } = uploadResponse.body.data;

      // Confirmar o upload
      const confirmResponse = await testClient.post(
        '/v1/me/avatar/confirm',
        { key },
        testClient.withAuth(accessToken)
      );

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body.success).toBe(true);
      expect(confirmResponse.body.data).toBeDefined();
      expect(confirmResponse.body.data.avatar_url).toBeDefined();
      expect(confirmResponse.body.data.avatar_url).toContain(key);
    });

    it('deve retornar erro 400 para key ausente', async () => {
      const response = await testClient.post(
        '/v1/me/avatar/confirm',
        {},
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details.message).toBe('Key is required');
    });

    it('deve retornar erro 400 para key inválida', async () => {
      const response = await testClient.post(
        '/v1/me/avatar/confirm',
        { key: 123 }, // Tipo inválido
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details.message).toBe('Key is required');
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      const response = await testClient.post('/v1/me/avatar/confirm', {
        key: 'avatars/test.jpg',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Integração completa', () => {
    it('deve permitir fluxo completo de upload e confirmação de avatar', async () => {
      // 1. Solicitar URL pré-assinada
      const uploadData = {
        file_name: 'profile-avatar.jpg',
        content_type: 'image/jpeg',
      };

      const uploadResponse = await testClient.post(
        '/v1/me/avatar/upload',
        uploadData,
        testClient.withAuth(accessToken)
      );

      expect(uploadResponse.status).toBe(200);
      const { upload_url, key, public_url } = uploadResponse.body.data;

      // Verificar que a URL contém a key
      expect(upload_url).toContain(key);
      expect(public_url).toContain(key);

      // 2. Confirmar upload (simulando que o arquivo foi enviado)
      const confirmResponse = await testClient.post(
        '/v1/me/avatar/confirm',
        { key },
        testClient.withAuth(accessToken)
      );

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body.data.avatar_url).toBe(public_url);

      // 3. Verificar se o perfil foi atualizado
      const profileResponse = await testClient.get(
        '/v1/me/profile',
        testClient.withAuth(accessToken)
      );

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.avatar_url).toBe(public_url);
    });
  });
});

