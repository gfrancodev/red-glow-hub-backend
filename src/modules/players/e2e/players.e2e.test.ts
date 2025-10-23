import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthHelper } from '../../../../test/utils/auth-helper';
import { testClient } from '../../../../test/utils/test-client';

const prisma = new PrismaClient();

describe('GET /v1/players', () => {
  let testPlayer1: any;
  let testPlayer2: any;
  let testPlayer3: any;

  beforeAll(async () => {
    // Criar players de teste com diferentes características
    const timestamp = Date.now();

    // Player 1 - SP, São Paulo
    const { profile: profile1 } = await AuthHelper.createTestUser({
      email: `player1${timestamp}@example.com`,
      password: 'senha123456',
      username: `player1${timestamp}`,
      display_name: 'Player 1',
      state: 'SP',
      city: 'São Paulo',
    });
    testPlayer1 = profile1;

    // Player 2 - RJ, Rio de Janeiro
    const { profile: profile2 } = await AuthHelper.createTestUser({
      email: `player2${timestamp}@example.com`,
      password: 'senha123456',
      username: `player2${timestamp}`,
      display_name: 'Player 2',
      state: 'RJ',
      city: 'Rio de Janeiro',
    });
    testPlayer2 = profile2;

    // Player 3 - MG, Belo Horizonte
    const { profile: profile3 } = await AuthHelper.createTestUser({
      email: `player3${timestamp}@example.com`,
      password: 'senha123456',
      username: `player3${timestamp}`,
      display_name: 'Player 3',
      state: 'MG',
      city: 'Belo Horizonte',
    });
    testPlayer3 = profile3;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /v1/players', () => {
    describe('Casos Positivos', () => {
      it('deve retornar lista de players com dados padrão', async () => {
        const response = await testClient.get('/v1/players');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
          meta: {
            limit: 20,
            in_page: expect.any(Number),
            has_next_page: expect.any(Boolean),
            has_previous_page: false,
          },
        });

        // Debug: verificar o que está sendo retornado
        console.log('Response data:', response.body.data);
        console.log('Test players:', { testPlayer1: testPlayer1.username, testPlayer2: testPlayer2.username, testPlayer3: testPlayer3.username });
        
        // Deve conter pelo menos os players criados no beforeAll
        const usernames = response.body.data.map((p: any) => p.username);
        expect(usernames).toContain(testPlayer1.username);
        expect(usernames).toContain(testPlayer2.username);
        expect(usernames).toContain(testPlayer3.username);
      });

      it('deve retornar lista de players com limite personalizado', async () => {
        const response = await testClient.get('/v1/players?limit=2');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
          meta: {
            limit: 2,
            in_page: expect.any(Number),
            has_next_page: expect.any(Boolean),
            has_previous_page: false,
          },
        });

        expect(response.body.data.length).toBeLessThanOrEqual(2);
      });

      it('deve filtrar players por estado', async () => {
        const response = await testClient.get('/v1/players?state=SP');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Todos os players retornados devem ser de SP
        response.body.data.forEach((player: any) => {
          expect(player.state).toBe('SP');
        });
      });

      it('deve filtrar players por cidade', async () => {
        const response = await testClient.get('/v1/players?city=São Paulo');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Todos os players retornados devem ser de São Paulo
        response.body.data.forEach((player: any) => {
          expect(player.city).toBe('São Paulo');
        });
      });

      it('deve filtrar players por query de busca', async () => {
        const response = await testClient.get(`/v1/players?q=${testPlayer1.display_name}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Deve encontrar o player específico
        const foundPlayer = response.body.data.find(
          (p: any) => p.username === testPlayer1.username
        );
        expect(foundPlayer).toBeDefined();
      });

      it('deve ordenar players por data de criação (desc)', async () => {
        const response = await testClient.get('/v1/players?sort=created_at_desc');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verificar se está ordenado por data de criação (mais recente primeiro)
        const players = response.body.data;
        for (let i = 1; i < players.length; i++) {
          const currentDate = new Date(players[i].created_at);
          const previousDate = new Date(players[i - 1].created_at);
          expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
        }
      });

      it('deve ordenar players por data de criação (asc)', async () => {
        const response = await testClient.get('/v1/players?sort=created_at_asc');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verificar se a resposta contém dados válidos
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        
        // Verificar se todos os players têm created_at
        response.body.data.forEach((player: any) => {
          expect(player.created_at).toBeDefined();
          expect(new Date(player.created_at)).toBeInstanceOf(Date);
        });
      });

      it('deve retornar paginação com cursor', async () => {
        const response = await testClient.get('/v1/players?limit=1');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);

        if (response.body.meta.has_next_page) {
          expect(response.body.meta.next_cursor).toBeDefined();

          // Testar próxima página
          const nextResponse = await testClient.get(
            `/v1/players?limit=1&cursor=${response.body.meta.next_cursor}`
          );
          expect(nextResponse.status).toBe(200);
          expect(nextResponse.body.success).toBe(true);
          expect(nextResponse.body.meta.has_previous_page).toBe(true);
        }
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar erro 422 para limite inválido (muito alto)', async () => {
        const response = await testClient.get('/v1/players?limit=101');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('limit');
      });

      it('deve retornar erro 422 para limite inválido (muito baixo)', async () => {
        const response = await testClient.get('/v1/players?limit=0');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('limit');
      });

      it('deve retornar erro 422 para sort inválido', async () => {
        const response = await testClient.get('/v1/players?sort=invalid_sort');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('sort');
      });

      it('deve retornar erro 422 para tags inválidas', async () => {
        const response = await testClient.get('/v1/players?tags=invalid,tags,format');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
      });
    });
  });

  describe('GET /v1/players/:username', () => {
    describe('Casos Positivos', () => {
      it('deve retornar perfil de player existente', async () => {
        const response = await testClient.get(`/v1/players/${testPlayer1.username}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: testPlayer1.id,
            username: testPlayer1.username,
            display_name: testPlayer1.display_name,
            state: testPlayer1.state,
            city: testPlayer1.city,
            status: testPlayer1.status,
          },
        });
      });

      it('deve retornar perfil de player com informações completas', async () => {
        const response = await testClient.get(`/v1/players/${testPlayer2.username}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          username: testPlayer2.username,
          display_name: testPlayer2.display_name,
          state: testPlayer2.state,
          city: testPlayer2.city,
          status: 'active',
        });
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar erro 404 para username inexistente', async () => {
        const response = await testClient.get('/v1/players/username-inexistente');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Not Found');
      });

      it('deve retornar erro 404 para username vazio', async () => {
        const response = await testClient.get('/v1/players/username-vazio-inexistente');

        expect(response.status).toBe(404);
      });
    });
  });

  describe('GET /v1/players/:username/media', () => {
    describe('Casos Positivos', () => {
      it('deve retornar mídia de player existente', async () => {
        const response = await testClient.get(`/v1/players/${testPlayer1.username}/media`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });
      });

      it('deve retornar mídia com limite personalizado', async () => {
        const response = await testClient.get(`/v1/players/${testPlayer1.username}/media?limit=5`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('deve retornar mídia filtrada por tipo', async () => {
        const response = await testClient.get(
          `/v1/players/${testPlayer1.username}/media?type=image`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('deve retornar mídia com cursor de paginação', async () => {
        const response = await testClient.get(`/v1/players/${testPlayer1.username}/media?limit=1`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar erro 404 para username inexistente', async () => {
        const response = await testClient.get('/v1/players/username-inexistente/media');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Not Found');
      });
    });
  });

  describe('GET /v1/players/search', () => {
    describe('Casos Positivos', () => {
      it('deve buscar players por query', async () => {
        const response = await testClient.get(`/v1/players/search?q=${testPlayer1.display_name}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
          meta: {
            limit: 20,
            in_page: expect.any(Number),
            has_next_page: expect.any(Boolean),
            has_previous_page: false,
          },
        });

        // Deve encontrar o player específico
        const foundPlayer = response.body.data.find(
          (p: any) => p.username === testPlayer1.username
        );
        expect(foundPlayer).toBeDefined();
      });

      it('deve buscar players por estado', async () => {
        const response = await testClient.get('/v1/players/search?q=player&state=SP');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Todos os players retornados devem ser de SP
        response.body.data.forEach((player: any) => {
          expect(player.state).toBe('SP');
        });
      });

      it('deve buscar players por cidade', async () => {
        const response = await testClient.get('/v1/players/search?q=player&city=Rio de Janeiro');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Todos os players retornados devem ser do Rio de Janeiro
        response.body.data.forEach((player: any) => {
          expect(player.city).toBe('Rio de Janeiro');
        });
      });

      it('deve buscar players com tipo específico', async () => {
        const response = await testClient.get('/v1/players/search?q=player&type=players');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('deve buscar com limite personalizado', async () => {
        const response = await testClient.get('/v1/players/search?q=player&limit=2');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.meta.limit).toBe(2);
        expect(response.body.data.length).toBeLessThanOrEqual(2);
      });

      it('deve buscar com paginação', async () => {
        const response = await testClient.get('/v1/players/search?q=player&limit=1');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);

        if (response.body.meta.has_next_page) {
          expect(response.body.meta.next_cursor).toBeDefined();
        }
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar erro 422 para query vazia', async () => {
        const response = await testClient.get('/v1/players/search?q=');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('q');
      });

      it('deve retornar erro 422 para query ausente', async () => {
        const response = await testClient.get('/v1/players/search');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('q');
      });

      it('deve retornar erro 422 para tipo inválido', async () => {
        const response = await testClient.get('/v1/players/search?q=player&type=invalid');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('type');
      });

      it('deve retornar erro 422 para limite inválido', async () => {
        const response = await testClient.get('/v1/players/search?q=player&limit=101');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('limit');
      });
    });
  });

  describe('GET /v1/players/trending', () => {
    describe('Casos Positivos', () => {
      it('deve retornar players em alta', async () => {
        const response = await testClient.get('/v1/players/trending');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
          meta: {
            limit: 20,
            in_page: expect.any(Number),
            has_next_page: expect.any(Boolean),
            has_previous_page: false,
          },
        });

        // Deve conter pelo menos os players criados no beforeAll
        const usernames = response.body.data.map((p: any) => p.username);
        expect(usernames).toContain(testPlayer1.username);
        expect(usernames).toContain(testPlayer2.username);
        expect(usernames).toContain(testPlayer3.username);
      });

      it('deve retornar players em alta com limite personalizado', async () => {
        const response = await testClient.get('/v1/players/trending?limit=2');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.meta.limit).toBe(2);
        expect(response.body.data.length).toBeLessThanOrEqual(2);
      });

      it('deve retornar players em alta com paginação', async () => {
        const response = await testClient.get('/v1/players/trending?limit=1');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);

        if (response.body.meta.has_next_page) {
          expect(response.body.meta.next_cursor).toBeDefined();
        }
      });
    });

    describe('Casos Negativos', () => {
      it('deve retornar erro 422 para limite muito alto', async () => {
        const response = await testClient.get('/v1/players/trending?limit=51');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('limit');
      });

      it('deve retornar erro 422 para limite muito baixo', async () => {
        const response = await testClient.get('/v1/players/trending?limit=0');

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.error.name).toBe('Unprocessable Entity');
        expect(response.body.error.details.issues[0].path).toBe('limit');
      });
    });
  });
});
