import { testClient } from './test-client';

export class TokenHelper {
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
    } catch (error) {
      // Se o refresh falhar, tentar fazer login novamente
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
   * Verifica se um token está próximo do vencimento
   */
  static isTokenNearExpiry(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;

      // Considerar próximo do vencimento se restam menos de 5 minutos
      return timeUntilExpiry < 300;
    } catch (error) {
      return true; // Se não conseguir decodificar, considerar inválido
    }
  }
}
