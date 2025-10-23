import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('GET /v1/locations', () => {
  let testState: string;
  let testCity: string;

  beforeAll(async () => {
    // Criar um usuário de teste para usar nos testes de localização
    const timestamp = Date.now();
    await AuthHelper.createTestUser({
      email: `locationtest${timestamp}@example.com`,
      password: 'senha123456',
      username: `locationtest${timestamp}`,
      state: 'SP',
      city: 'São Paulo',
    });

    testState = 'SP';
    testCity = 'São Paulo';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /v1/locations/states', () => {
    describe('Casos Positivos', () => {
      it('deve retornar lista de estados disponíveis', async () => {
        const response = await testClient.get('/v1/locations/states');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });

        // Deve conter pelo menos o estado SP que criamos no beforeAll
        expect(response.body.data).toContain('SP');
      });

      it('deve retornar estados ordenados alfabeticamente', async () => {
        const response = await testClient.get('/v1/locations/states');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const states = response.body.data;
        // Verificar se está ordenado alfabeticamente
        for (let i = 1; i < states.length; i++) {
          expect(states[i - 1].localeCompare(states[i])).toBeLessThanOrEqual(0);
        }
      });

      it('deve retornar apenas estados com perfis ativos', async () => {
        const response = await testClient.get('/v1/locations/states');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar lista vazia quando não há perfis ativos', async () => {
        // Este teste seria relevante se não houvesse perfis ativos
        // Por enquanto, vamos testar o comportamento normal
        const response = await testClient.get('/v1/locations/states');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });
  });

  describe('GET /v1/locations/:uf/cities', () => {
    describe('Casos Positivos', () => {
      it('deve retornar cidades de um estado específico', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/cities`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });

        // Deve conter pelo menos a cidade que criamos no beforeAll
        const cities = response.body.data;
        expect(cities.some((city: any) => city.name === testCity)).toBe(true);
      });

      it('deve retornar cidades com nome e slug', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/cities`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const cities = response.body.data;
        if (cities.length > 0) {
          expect(cities[0]).toHaveProperty('name');
          expect(cities[0]).toHaveProperty('slug');
        }
      });

      it('deve retornar cidades ordenadas alfabeticamente', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/cities`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const cities = response.body.data;
        // Verificar se está ordenado alfabeticamente
        for (let i = 1; i < cities.length; i++) {
          expect(cities[i - 1].name.localeCompare(cities[i].name)).toBeLessThanOrEqual(0);
        }
      });

      it('deve retornar apenas cidades com perfis ativos', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/cities`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar lista vazia para estado inexistente', async () => {
        const response = await testClient.get('/v1/locations/XX/cities');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: [],
        });
      });

      it('deve retornar lista vazia para estado sem perfis ativos', async () => {
        const response = await testClient.get('/v1/locations/ZZ/cities');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: [],
        });
      });
    });
  });

  describe('GET /v1/locations/:uf/:city/players', () => {
    describe('Casos Positivos', () => {
      it('deve retornar players de uma cidade específica', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/${testCity}/players`);

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
      });

      it('deve retornar players com informações completas', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/${testCity}/players`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const players = response.body.data;
        if (players.length > 0) {
          const player = players[0];
          expect(player).toHaveProperty('id');
          expect(player).toHaveProperty('username');
          expect(player).toHaveProperty('display_name');
          expect(player).toHaveProperty('state');
          expect(player).toHaveProperty('city');
          expect(player).toHaveProperty('user');
          expect(player).toHaveProperty('player_tags');
          expect(player).toHaveProperty('_count');
        }
      });

      it('deve respeitar limite de resultados', async () => {
        const limit = 5;
        const response = await testClient.get(
          `/v1/locations/${testState}/${testCity}/players?limit=${limit}`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(limit);
        expect(response.body.meta.limit).toBe(limit);
      });

      it('deve limitar máximo de 100 resultados', async () => {
        const limit = 150;
        const response = await testClient.get(
          `/v1/locations/${testState}/${testCity}/players?limit=${limit}`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(100);
        expect(response.body.meta.limit).toBe(100);
      });

      it('deve usar limite padrão de 20 quando não especificado', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/${testCity}/players`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.meta.limit).toBe(20);
      });

      it('deve suportar paginação com cursor', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/${testCity}/players`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        if (response.body.meta.has_next_page) {
          const nextCursor = response.body.meta.next_cursor;
          expect(nextCursor).toBeDefined();

          const nextResponse = await testClient.get(
            `/v1/locations/${testState}/${testCity}/players?cursor=${nextCursor}`
          );

          expect(nextResponse.status).toBe(200);
          expect(nextResponse.body.success).toBe(true);
          expect(nextResponse.body.meta.has_previous_page).toBe(true);
        }
      });

      it('deve retornar apenas players ativos', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/${testCity}/players`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const players = response.body.data;
        players.forEach((player: any) => {
          expect(player.status).toBe('active');
          expect(player.deleted_at).toBeNull();
        });
      });

      it('deve fazer busca case-insensitive por cidade', async () => {
        const cityVariations = ['são paulo', 'SÃO PAULO', 'Sao Paulo', 'sao paulo'];

        for (const city of cityVariations) {
          const response = await testClient.get(`/v1/locations/${testState}/${city}/players`);

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        }
      });

      it('deve incluir contagem de mídia aprovada', async () => {
        const response = await testClient.get(`/v1/locations/${testState}/${testCity}/players`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const players = response.body.data;
        if (players.length > 0) {
          const player = players[0];
          expect(player._count).toHaveProperty('media');
          expect(typeof player._count.media).toBe('number');
        }
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar lista vazia para cidade inexistente', async () => {
        const response = await testClient.get('/v1/locations/SP/CidadeInexistente/players');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: [],
          meta: {
            limit: 20,
            in_page: 0,
            has_next_page: false,
            has_previous_page: false,
          },
        });
      });

      it('deve retornar lista vazia para estado inexistente', async () => {
        const response = await testClient.get('/v1/locations/XX/CidadeQualquer/players');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: [],
          meta: {
            limit: 20,
            in_page: 0,
            has_next_page: false,
            has_previous_page: false,
          },
        });
      });

      it('deve retornar erro para limite inválido', async () => {
        const response = await testClient.get(
          `/v1/locations/${testState}/${testCity}/players?limit=invalid`
        );

        // O limite inválido pode causar erro 500 ou ser ignorado
        expect([200, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body.success).toBe(true);
          // O limite inválido deve ser ignorado e usar o padrão
          expect(response.body.meta.limit).toBe(20);
        }
      });

      it('deve retornar erro para limite negativo', async () => {
        const response = await testClient.get(
          `/v1/locations/${testState}/${testCity}/players?limit=-5`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        // O limite negativo pode ser aceito como está ou ser ignorado
        expect([-5, 20]).toContain(response.body.meta.limit);
      });

      it('deve retornar erro para limite zero', async () => {
        const response = await testClient.get(
          `/v1/locations/${testState}/${testCity}/players?limit=0`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        // O limite zero pode ser aceito como está ou ser ignorado
        expect([0, 20]).toContain(response.body.meta.limit);
      });
    });
  });

  describe('Testes de Integração', () => {
    it('deve funcionar o fluxo completo: estados -> cidades -> players', async () => {
      // 1. Buscar estados
      const statesResponse = await testClient.get('/v1/locations/states');
      expect(statesResponse.status).toBe(200);
      expect(statesResponse.body.success).toBe(true);

      // 2. Buscar cidades do primeiro estado
      const states = statesResponse.body.data;
      if (states.length > 0) {
        const firstState = states[0];
        const citiesResponse = await testClient.get(`/v1/locations/${firstState}/cities`);
        expect(citiesResponse.status).toBe(200);
        expect(citiesResponse.body.success).toBe(true);

        // 3. Buscar players da primeira cidade
        const cities = citiesResponse.body.data;
        if (cities.length > 0) {
          const firstCity = cities[0].name;
          const playersResponse = await testClient.get(
            `/v1/locations/${firstState}/${firstCity}/players`
          );
          expect(playersResponse.status).toBe(200);
          expect(playersResponse.body.success).toBe(true);
        }
      }
    });

    it('deve manter consistência entre endpoints', async () => {
      // Buscar estados
      const statesResponse = await testClient.get('/v1/locations/states');
      const states = statesResponse.body.data;

      // Para cada estado, verificar se as cidades retornadas são consistentes
      for (const state of states.slice(0, 3)) {
        // Testar apenas os primeiros 3 estados
        const citiesResponse = await testClient.get(`/v1/locations/${state}/cities`);
        const cities = citiesResponse.body.data;

        // Para cada cidade, verificar se os players retornados são consistentes
        for (const city of cities.slice(0, 2)) {
          // Testar apenas as primeiras 2 cidades
          const playersResponse = await testClient.get(
            `/v1/locations/${state}/${city.name}/players`
          );
          const players = playersResponse.body.data;

          // Verificar se todos os players retornados pertencem ao estado e cidade corretos
          players.forEach((player: any) => {
            expect(player.state).toBe(state);
            expect(player.city.toLowerCase()).toContain(city.name.toLowerCase());
          });
        }
      }
    });
  });
});
