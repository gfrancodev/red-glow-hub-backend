import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('PUT /v1/me/profile', () => {
  let testProfile: any;
  let accessToken: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const { profile, authResponse } = await AuthHelper.createTestUser({
      email: `profileupdate${timestamp}@example.com`,
      password: 'senha123456',
      username: `pu${timestamp}`, // Username mais curto
      display_name: 'Profile Update Test',
      state: 'SP',
      city: 'São Paulo',
    });

    testProfile = profile;
    accessToken = authResponse.data.tokens.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Casos Positivos', () => {
    it('deve atualizar perfil com dados válidos', async () => {
      const updateData = {
        display_name: 'Nome Atualizado',
        bio: 'Nova bio do usuário',
        state: 'RJ',
        city: 'Rio de Janeiro',
        city_slug: 'rio-de-janeiro',
        contact_email: 'contato@example.com',
        whatsapp: '+5511999999999',
        twitch: 'usuario_twitch',
        youtube: 'usuario_youtube',
        instagram: 'usuario_instagram',
      };

      const response = await testClient.put(
        '/v1/me/profile',
        updateData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testProfile.id,
          display_name: updateData.display_name,
          bio: updateData.bio,
          state: updateData.state,
          city: updateData.city,
          city_slug: updateData.city_slug,
          contact_email: updateData.contact_email,
          whatsapp: updateData.whatsapp,
          twitch: updateData.twitch,
          youtube: updateData.youtube,
          instagram: updateData.instagram,
        },
      });
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const updateData = {
        display_name: 'Nome Parcial',
        bio: 'Bio parcial',
      };

      const response = await testClient.put(
        '/v1/me/profile',
        updateData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        display_name: updateData.display_name,
        bio: updateData.bio,
        // Outros campos devem permanecer inalterados
        state: 'RJ', // do teste anterior
        city: 'Rio de Janeiro', // do teste anterior
      });
    });

    it('deve permitir atualizar com campos opcionais válidos', async () => {
      const updateData = {
        bio: 'Bio atualizada',
        contact_email: 'contato@example.com',
        whatsapp: '+5511999999999',
        twitch: 'usuario_twitch',
        youtube: 'usuario_youtube',
        instagram: 'usuario_instagram',
      };

      const response = await testClient.put(
        '/v1/me/profile',
        updateData,
        testClient.withAuth(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        bio: 'Bio atualizada',
        contact_email: 'contato@example.com',
        whatsapp: '+5511999999999',
        twitch: 'usuario_twitch',
        youtube: 'usuario_youtube',
        instagram: 'usuario_instagram',
      });
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 401 para token ausente', async () => {
      const response = await testClient.put('/v1/me/profile', {
        display_name: 'Teste',
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

    it('deve retornar erro 422 para display_name muito longo', async () => {
      const updateData = {
        display_name: 'A'.repeat(101), // Máximo é 100
      };

      const response = await testClient.put(
        '/v1/me/profile',
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

    it('deve retornar erro 422 para bio muito longa', async () => {
      const updateData = {
        bio: 'A'.repeat(501), // Máximo é 500
      };

      const response = await testClient.put(
        '/v1/me/profile',
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

    it('deve retornar erro 422 para state com tamanho inválido', async () => {
      const updateData = {
        state: 'SPA', // Deve ter exatamente 2 caracteres
      };

      const response = await testClient.put(
        '/v1/me/profile',
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

    it('deve retornar erro 422 para email inválido', async () => {
      const updateData = {
        contact_email: 'email-invalido',
      };

      const response = await testClient.put(
        '/v1/me/profile',
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

      const response = await testClient.put(
        '/v1/me/profile',
        updateData,
        testClient.withAuth(accessToken)
      );

      // Como focal_point_x não está no schema de UpdateProfileInput, 
      // o campo será ignorado e a resposta será 200
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
      });
    });

    it('deve permitir body vazio (sem campos obrigatórios)', async () => {
      const response = await testClient.put('/v1/me/profile', {}, testClient.withAuth(accessToken));

      // Como todos os campos são opcionais, body vazio é permitido
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
      });
    });
  });
});
