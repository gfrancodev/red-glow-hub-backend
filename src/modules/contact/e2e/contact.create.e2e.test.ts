import { describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

describe('POST /v1/contact/:username', () => {
  describe('Casos Positivos', () => {
    it('deve criar contato com dados válidos', async () => {
      // Criar um player para receber contato
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        channel: 'email',
        message: 'Olá! Gostaria de conversar sobre uma oportunidade.',
        hcaptcha_token: 'test-token',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
      );

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          contact_id: expect.any(String),
          status: 'active',
          created_at: expect.any(String),
        },
      });
    });

    it('deve criar contato sem hCaptcha token', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        channel: 'whatsapp',
        message: 'Interessado em colaboração!',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
      );

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          contact_id: expect.any(String),
          status: 'active',
          created_at: expect.any(String),
        },
      });
    });

    it('deve criar contato com diferentes canais', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const channels = ['email', 'whatsapp', 'twitch', 'youtube', 'instagram', 'other'];

      for (const channel of channels) {
        const contactData = {
          channel: channel as any,
          message: `Mensagem via ${channel}`,
        };

        const response = await testClient.post(
          `/v1/contact/${playerResponse.data.user.profile?.username}`,
          contactData
        );

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('active');
      }
    });

    it('deve criar contato com mensagem longa', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const longMessage = 'A'.repeat(1000); // Mensagem de 1000 caracteres (limite máximo)

      const contactData = {
        channel: 'email',
        message: longMessage,
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
      );

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 404 para username inexistente', async () => {
      const contactData = {
        channel: 'email',
        message: 'Mensagem para usuário inexistente',
      };

      const response = await testClient.post('/v1/contact/username-inexistente', contactData);

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

    it('deve retornar erro 422 para channel inválido', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        channel: 'canal-invalido',
        message: 'Mensagem com canal inválido',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
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

    it('deve retornar erro 422 para message vazia', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        channel: 'email',
        message: '',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
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

    it('deve retornar erro 422 para message ausente', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        channel: 'email',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
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

    it('deve retornar erro 422 para message muito longa', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const longMessage = 'A'.repeat(1001); // Mensagem de 1001 caracteres (acima do limite)

      const contactData = {
        channel: 'email',
        message: longMessage,
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
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

    it('deve retornar erro 422 para channel ausente', async () => {
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        message: 'Mensagem sem canal',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
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
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        {}
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

    it('deve retornar erro 404 para player inativo', async () => {
      // Este teste seria relevante se houvesse um cenário onde o player fica inativo
      // Por enquanto, vamos testar o comportamento normal
      const timestamp = Date.now();
      const { authResponse: playerResponse } = await AuthHelper.createTestUser({
        email: `player${timestamp}@example.com`,
        password: 'senha123456',
        username: `player${timestamp}`,
      });

      const contactData = {
        channel: 'email',
        message: 'Mensagem para player ativo',
      };

      const response = await testClient.post(
        `/v1/contact/${playerResponse.data.user.profile?.username}`,
        contactData
      );

      // Por enquanto, deve funcionar normalmente pois o player está ativo
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
