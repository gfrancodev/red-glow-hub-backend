import { env } from '@/shared/config/env';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Redis from 'ioredis';
import RedisStore, { type RedisReply } from 'rate-limit-redis';

// Redis client for rate limiting - com fallback para memória em caso de erro
let redis: Redis;
let redisStore: RedisStore;

try {
  redis = new Redis(env.REDIS_URL);
  redisStore = new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as unknown as Promise<RedisReply>,
  });
} catch {
  // eslint-disable-next-line no-console
  console.warn('Redis não disponível, usando rate limiting em memória');
  redis = null as unknown as Redis;
  redisStore = null as unknown as RedisStore;
}

export const corsConfig = cors({
  origin: '*',
  credentials: true,
  //methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
});

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Configuração de rate limiting baseada no ambiente
const getRateLimitConfig = () => {
  const isTest = env.NODE_ENV === 'test';
  const isDevelopment = env.NODE_ENV === 'development';

  // Em ambiente de teste, desabilitar rate limiting completamente
  if (isTest) {
    return (req: any, res: any, next: any) => {
      next();
    };
  }

  // Em desenvolvimento, usar configuração moderada
  if (isDevelopment) {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 500, // 500 requests por 15 minutos
      message: {
        success: false,
        code: 'PL-0429',
        error: {
          id: crypto.randomUUID(),
          status: 429,
          name: 'Too Many Requests',
          details: {
            timestamp: new Date().toISOString(),
            message: 'Rate limit exceeded',
          },
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.setHeader('x-rate-limit-limit', '500');
        res.setHeader('x-rate-limit-remaining', '0');
        res.setHeader('x-rate-limit-reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());
        res.status(429).json({
          success: false,
          code: 'PL-0429',
          error: {
            id: crypto.randomUUID(),
            status: 429,
            name: 'Too Many Requests',
            details: {
              timestamp: new Date().toISOString(),
              path: req.originalUrl || req.url,
              message: 'Rate limit exceeded',
            },
          },
        });
      },
    });
  }

  // Em produção, usar Redis se disponível, senão memória
  const store = redisStore;

  return rateLimit({
    store,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: {
      success: false,
      code: 'PL-0429',
      error: {
        id: crypto.randomUUID(),
        status: 429,
        name: 'Too Many Requests',
        details: {
          timestamp: new Date().toISOString(),
          message: 'Rate limit exceeded',
        },
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.setHeader('x-rate-limit-limit', env.RATE_LIMIT_MAX);
      res.setHeader('x-rate-limit-remaining', '0');
      res.setHeader(
        'x-rate-limit-reset',
        new Date(Date.now() + env.RATE_LIMIT_WINDOW_MS).toISOString()
      );
      res.status(429).json({
        success: false,
        code: 'PL-0429',
        error: {
          id: crypto.randomUUID(),
          status: 429,
          name: 'Too Many Requests',
          details: {
            timestamp: new Date().toISOString(),
            path: req.originalUrl || req.url,
            message: 'Rate limit exceeded',
          },
        },
      });
    },
  });
};

export const rateLimitConfig = getRateLimitConfig();
