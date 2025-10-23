import type { AuthResponse } from '@/modules/auth/auth.types';
import { testClient } from './test-client';

export interface TestUser {
  email: string;
  password: string;
  username: string;
  display_name: string;
  state: string;
  city: string;
  city_slug?: string;
}

export const defaultTestUser: TestUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
  display_name: 'Test User',
  state: 'SP',
  city: 'São Paulo',
  city_slug: 'sao-paulo',
};

// Usuários pré-criados no seed para testes específicos
export const seedUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123456',
    username: 'admin_test',
    display_name: 'Admin Test',
    state: 'SP',
    city: 'São Paulo',
    city_slug: 'sao-paulo',
  },
  moderator: {
    email: 'moderator@test.com',
    password: 'mod123456',
    username: 'mod_test',
    display_name: 'Moderator Test',
    state: 'RJ',
    city: 'Rio de Janeiro',
    city_slug: 'rio-de-janeiro',
  },
  player: {
    email: 'player@test.com',
    password: 'player123456',
    username: 'player_test',
    display_name: 'Player Test',
    state: 'MG',
    city: 'Belo Horizonte',
    city_slug: 'belo-horizonte',
  },
  inactive: {
    email: 'inactive@test.com',
    password: 'inactive123456',
    username: 'inactive_test',
    display_name: 'Inactive Test',
    state: 'RS',
    city: 'Porto Alegre',
    city_slug: 'porto-alegre',
  },
} as const;

export class AuthHelper {
  /**
   * Cria um usuário de teste e retorna os dados de autenticação
   */
  static async createTestUser(userData: Partial<TestUser> = {}): Promise<{
    user: TestUser;
    profile: unknown;
    authResponse: AuthResponse;
  }> {
    const user = { ...defaultTestUser, ...userData };

    const response = await testClient.post('/v1/auth/signup', user);

    if (response.status !== 201) {
      throw new Error(
        `Falha ao criar usuário de teste: ${response.status} - ${JSON.stringify(response.body)}`
      );
    }

    return {
      user,
      profile: response.body.data.user.profile,
      authResponse: response.body,
    };
  }

  /**
   * Faz login com um usuário existente
   */
  static async loginUser(email: string, password: string): Promise<AuthResponse> {
    const response = await testClient.post('/v1/auth/login', { email, password });

    if (response.status !== 200) {
      throw new Error(`Falha no login: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    return response.body;
  }

  /**
   * Cria um usuário e retorna apenas o access token
   */
  static async getAccessToken(userData: Partial<TestUser> = {}): Promise<string> {
    const { authResponse } = await this.createTestUser(userData);
    return authResponse.data.tokens.access_token;
  }

  /**
   * Cria um usuário e retorna o refresh token
   */
  static async getRefreshToken(userData: Partial<TestUser> = {}): Promise<string> {
    const { authResponse } = await this.createTestUser(userData);
    return authResponse.data.tokens.refresh_token;
  }

  /**
   * Cria um usuário e retorna ambos os tokens
   */
  static async getTokenPair(userData: Partial<TestUser> = {}): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const { authResponse } = await this.createTestUser(userData);
    return authResponse.data.tokens;
  }

  /**
   * Obtém um token válido, fazendo refresh se necessário
   */
  static async getValidToken(userEmail: string, refreshToken: string): Promise<string> {
    try {
      const refreshResponse = await testClient.post('/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (refreshResponse.status === 200) {
        return refreshResponse.body.data.tokens.access_token;
      }
    } catch {
      // Se o refresh falhar, tentar fazer login novamente
      // eslint-disable-next-line no-console
      console.warn('Token refresh failed, attempting new login');
    }

    // Fallback: fazer login novamente
    const loginResponse = await testClient.post('/v1/auth/login', {
      email: userEmail,
      password: 'senha123456',
    });

    if (loginResponse.status === 200) {
      return loginResponse.body.data.tokens.access_token;
    }

    throw new Error('Failed to obtain valid token');
  }

  /**
   * Faz login com usuário pré-criado no seed
   */
  static async loginSeedUser(userType: keyof typeof seedUsers): Promise<AuthResponse> {
    const user = seedUsers[userType];
    return this.loginUser(user.email, user.password);
  }

  /**
   * Obtém access token de usuário pré-criado no seed
   */
  static async getSeedUserToken(userType: keyof typeof seedUsers): Promise<string> {
    const authResponse = await this.loginSeedUser(userType);
    return authResponse.data.tokens.access_token;
  }

  /**
   * Obtém refresh token de usuário pré-criado no seed
   */
  static async getSeedUserRefreshToken(userType: keyof typeof seedUsers): Promise<string> {
    const authResponse = await this.loginSeedUser(userType);
    return authResponse.data.tokens.refresh_token;
  }

  /**
   * Obtém par de tokens de usuário pré-criado no seed
   */
  static async getSeedUserTokenPair(userType: keyof typeof seedUsers): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const authResponse = await this.loginSeedUser(userType);
    return authResponse.data.tokens;
  }
}
