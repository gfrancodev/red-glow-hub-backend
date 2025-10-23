import request from 'supertest';
import { buildApp } from '../../src/app/app';

export class TestClient {
  private app: any;

  constructor() {
    this.app = buildApp();
  }

  async get(path: string, headers?: Record<string, string>) {
    try {
      const response = await request(this.app)
        .get(path)
        .set({
          'Content-Type': 'application/json',
          ...headers,
        });

      return {
        status: response.status,
        body: response.body,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`Erro na requisição GET: ${error}`);
    }
  }

  async post(path: string, body: object, headers?: Record<string, string>) {
    try {
      const response = await request(this.app)
        .post(path)
        .send(body)
        .set({
          'Content-Type': 'application/json',
          ...headers,
        });

      return {
        status: response.status,
        body: response.body,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`Erro na requisição POST: ${error}`);
    }
  }

  async put(path: string, body: object, headers?: Record<string, string>) {
    try {
      const response = await request(this.app)
        .put(path)
        .send(body)
        .set({
          'Content-Type': 'application/json',
          ...headers,
        });

      return {
        status: response.status,
        body: response.body,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`Erro na requisição PUT: ${error}`);
    }
  }

  async delete(path: string, headers?: Record<string, string>) {
    try {
      const response = await request(this.app)
        .delete(path)
        .set({
          'Content-Type': 'application/json',
          ...headers,
        });

      return {
        status: response.status,
        body: response.body,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`Erro na requisição DELETE: ${error}`);
    }
  }

  async patch(path: string, body: object, headers?: Record<string, string>) {
    try {
      const response = await request(this.app)
        .patch(path)
        .send(body)
        .set({
          'Content-Type': 'application/json',
          ...headers,
        });

      return {
        status: response.status,
        body: response.body,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`Erro na requisição PATCH: ${error}`);
    }
  }

  withAuth(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }
}

export const testClient = new TestClient();
