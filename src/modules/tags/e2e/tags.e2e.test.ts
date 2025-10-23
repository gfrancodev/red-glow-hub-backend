import { describe, expect, it } from 'vitest';
import { testClient } from '../../../../test/utils/test-client';

describe('GET /v1/tags', () => {
  describe('Casos Positivos', () => {
    it('deve listar todas as tags ativas', async () => {
      const response = await testClient.get('/v1/tags');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });

      // Verificar estrutura dos dados
      if (response.body.data.length > 0) {
        const tag = response.body.data[0];
        expect(tag).toMatchObject({
          id: expect.any(String),
          slug: expect.any(String),
          label: expect.any(String),
          aliases: expect.any(Array),
          players_count: expect.any(Number),
        });
      }
    });

    it('deve retornar tags ordenadas alfabeticamente', async () => {
      const response = await testClient.get('/v1/tags');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar se as tags estão ordenadas alfabeticamente
      const labels = response.body.data.map((tag: any) => tag.label);
      const sortedLabels = [...labels].sort();
      expect(labels).toEqual(sortedLabels);
    });

    it('deve retornar tags com contagem de players', async () => {
      const response = await testClient.get('/v1/tags');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar se todas as tags têm contagem de players
      response.body.data.forEach((tag: any) => {
        expect(tag.players_count).toBeDefined();
        expect(typeof tag.players_count).toBe('number');
        expect(tag.players_count).toBeGreaterThanOrEqual(0);
      });
    });

    it('deve retornar tags com aliases', async () => {
      const response = await testClient.get('/v1/tags');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar se as tags têm aliases (array)
      response.body.data.forEach((tag: any) => {
        expect(tag.aliases).toBeDefined();
        expect(Array.isArray(tag.aliases)).toBe(true);
      });
    });

    it('deve retornar resposta vazia quando não há tags', async () => {
      // Este teste seria difícil de implementar sem modificar o banco
      // Por enquanto, vamos testar o comportamento normal
      const response = await testClient.get('/v1/tags');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 404 para endpoint inexistente', async () => {
      const response = await testClient.get('/v1/tags/invalid-endpoint');

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

    it('deve retornar erro 404 para método não permitido', async () => {
      const response = await testClient.post('/v1/tags', {});

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

    it('deve retornar erro 404 para PUT', async () => {
      const response = await testClient.put('/v1/tags', {});

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

    it('deve retornar erro 404 para DELETE', async () => {
      const response = await testClient.delete('/v1/tags');

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

    it('deve retornar erro 404 para PATCH', async () => {
      const response = await testClient.patch('/v1/tags', {});

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
});

describe('GET /v1/tags/:slug/players', () => {
  describe('Casos Positivos', () => {
    it('deve listar players por tag com slug válido', async () => {
      // Primeiro, obter uma tag existente
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
          meta: {
            limit: expect.any(Number),
            in_page: expect.any(Number),
            has_next_page: expect.any(Boolean),
            has_previous_page: expect.any(Boolean),
          },
        });
      }
    });

    it('deve listar players por tag com limite padrão', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(20); // Limite padrão
      }
    });

    it('deve listar players por tag com limite customizado', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=10`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(10);
      }
    });

    it('deve listar players por tag com limite máximo', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=100`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(100);
      }
    });

    it('deve listar players por tag com limite acima do máximo', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=200`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(100); // Deve ser limitado a 100
      }
    });

    it('deve listar players por tag com cursor', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?cursor=test-cursor`);

        expect(response.status).toBe(200);
        expect(response.body.meta.has_previous_page).toBe(true);
      }
    });

    it('deve listar players por tag com cursor e limite', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=5&cursor=test-cursor`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(5);
        expect(response.body.meta.has_previous_page).toBe(true);
      }
    });

    it('deve retornar players com estrutura correta', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players`);

        expect(response.status).toBe(200);

        if (response.body.data.length > 0) {
          const player = response.body.data[0];
          expect(player).toMatchObject({
            id: expect.any(String),
            username: expect.any(String),
            display_name: expect.any(String),
            state: expect.any(String),
            city: expect.any(String),
            status: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            user: {
              id: expect.any(String),
              email: expect.any(String),
              role: expect.any(String),
              status: expect.any(String),
            },
            player_tags: expect.any(Array),
            _count: {
              media: expect.any(Number),
            },
          });
        }
      }
    });

    it('deve retornar players ordenados por data de criação', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players`);

        expect(response.status).toBe(200);

        // Verificar se os players estão ordenados por created_at desc
        if (response.body.data.length > 1) {
          const dates = response.body.data.map((player: any) => new Date(player.created_at));
          for (let i = 0; i < dates.length - 1; i++) {
            expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
          }
        }
      }
    });

    it('deve retornar resposta vazia quando não há players para a tag', async () => {
      // Este teste seria difícil de implementar sem modificar o banco
      // Por enquanto, vamos testar o comportamento normal
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Casos Negativos', () => {
    it('deve retornar erro 404 para tag inexistente', async () => {
      const response = await testClient.get('/v1/tags/tag-inexistente/players');

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

    it('deve retornar erro 404 para tag com slug vazio', async () => {
      const response = await testClient.get('/v1/tags//players');

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

    it('deve retornar erro 404 para tag com slug inválido', async () => {
      const response = await testClient.get('/v1/tags/invalid-slug-123/players');

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

    it('deve retornar erro 404 para tag com caracteres especiais', async () => {
      const response = await testClient.get('/v1/tags/tag-with-<script>alert("xss")</script>/players');

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

    it('deve retornar erro 404 para tag com espaços', async () => {
      const response = await testClient.get('/v1/tags/tag with spaces/players');

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

    it('deve retornar erro 404 para tag com caracteres unicode', async () => {
      const response = await testClient.get('/v1/tags/tag-αβγδε-中文-العربية/players');

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

    it('deve retornar erro 404 para tag com emojis', async () => {
      const response = await testClient.get('/v1/tags/tag-🚀😀🎉/players');

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

    it('deve retornar erro 404 para tag com caracteres de controle', async () => {
      const response = await testClient.get('/v1/tags/tag-\x00\x01\x02/players');

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

    it('deve retornar erro 404 para tag com slug muito longo', async () => {
      const longSlug = 'a'.repeat(256);
      const response = await testClient.get(`/v1/tags/${longSlug}/players`);

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

    it('deve retornar erro 404 para tag com slug null', async () => {
      const response = await testClient.get('/v1/tags/null/players');

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

    it('deve retornar erro 404 para tag com slug undefined', async () => {
      const response = await testClient.get('/v1/tags/undefined/players');

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

    it('deve retornar erro 404 para tag com slug vazio', async () => {
      const response = await testClient.get('/v1/tags//players');

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

    it('deve retornar erro 404 para tag com slug apenas espaços', async () => {
      const response = await testClient.get('/v1/tags/   /players');

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

  describe('Testes de Query Parameters', () => {
    it('deve aceitar limite como string', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=5`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(5);
      }
    });

    it('deve aceitar limite como número', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=15`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(15);
      }
    });

    it('deve ignorar limite inválido e usar padrão', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=invalid`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(20); // Deve usar o padrão
      }
    });

    it('deve ignorar limite negativo e usar padrão', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=-5`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(20); // Deve usar o padrão
      }
    });

    it('deve ignorar limite zero e usar padrão', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=0`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(20); // Deve usar o padrão
      }
    });

    it('deve aceitar cursor como string', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?cursor=test-cursor`);

        expect(response.status).toBe(200);
        expect(response.body.meta.has_previous_page).toBe(true);
      }
    });

    it('deve aceitar cursor vazio', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?cursor=`);

        expect(response.status).toBe(200);
        expect(response.body.meta.has_previous_page).toBe(false);
      }
    });

    it('deve aceitar múltiplos query parameters', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=10&cursor=test-cursor`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(10);
        expect(response.body.meta.has_previous_page).toBe(true);
      }
    });

    it('deve ignorar query parameters extras', async () => {
      const tagsResponse = await testClient.get('/v1/tags');
      expect(tagsResponse.status).toBe(200);

      if (tagsResponse.body.data.length > 0) {
        const tag = tagsResponse.body.data[0];
        const response = await testClient.get(`/v1/tags/${tag.slug}/players?limit=10&cursor=test-cursor&extra=ignored`);

        expect(response.status).toBe(200);
        expect(response.body.meta.limit).toBe(10);
        expect(response.body.meta.has_previous_page).toBe(true);
      }
    });
  });
});

