import { env } from './env';

export const secrets = {
  jwt: {
    access: env.JWT_SECRET,
    refresh: env.JWT_REFRESH_SECRET,
  },
  redis: {
    url: env.REDIS_URL,
  },
  r2: {
    endpoint: env.R2_ENDPOINT,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
  },
  mercadopago: {
    accessToken: env.MP_ACCESS_TOKEN,
  },
  hcaptcha: env.HCAPTCHA_SECRET,
} as const;
