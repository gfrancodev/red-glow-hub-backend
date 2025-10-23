import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT Secrets
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Redis
  REDIS_URL: z.string().url(),

  // Cloudflare R2
  R2_ENDPOINT: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),

  // Mercado Pago
  MP_ACCESS_TOKEN: z.string(),

  // API Configuration
  API_VERSION: z.string().default('v1'),
  PORT: z
    .string()
    .transform(Number)
    .default(() => 3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional
  HCAPTCHA_SECRET: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .default(() => 900000), // 15 minutes
  RATE_LIMIT_MAX: z
    .string()
    .transform(Number)
    .default(() => 100),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
