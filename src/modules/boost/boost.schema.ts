import { z } from 'zod';

export const CheckoutInput = z.object({
  plan: z.enum(['basic', 'premium', 'vip']).describe('Plano de impulsionamento'),
  duration_days: z.number().min(1).max(30).default(7).describe('Duração em dias (1-30)'),
});

export const WebhookEvent = z.object({
  id: z.number().describe('ID do evento'),
  live_mode: z.boolean().describe('Modo de produção'),
  type: z.string().describe('Tipo do evento'),
  date_created: z.string().describe('Data de criação'),
  user_id: z.number().describe('ID do usuário'),
  api_version: z.string().describe('Versão da API'),
  action: z.string().describe('Ação realizada'),
  data: z.object({
    id: z.string().describe('ID dos dados'),
  }),
});

// Response schemas
export const CheckoutResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    boost_id: z.string().describe('ID do boost'),
    payment_id: z.string().describe('ID do pagamento'),
    qr_code: z.string().describe('QR Code para pagamento'),
    qr_code_base64: z.string().describe('QR Code em base64'),
    ticket_url: z.string().describe('URL do boleto'),
    amount: z.number().describe('Valor em centavos'),
    currency: z.string().describe('Moeda'),
    expires_at: z.string().describe('Data de expiração'),
  }),
});

export const BoostStatusResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    boosts: z.array(z.object({
      id: z.string().describe('ID do boost'),
      status: z.string().describe('Status do boost'),
      starts_at: z.string().describe('Data de início'),
      ends_at: z.string().describe('Data de fim'),
      amount_cents: z.number().describe('Valor em centavos'),
      currency: z.string().describe('Moeda'),
      provider: z.string().describe('Provedor de pagamento'),
      created_at: z.string().describe('Data de criação'),
    })),
  }),
});

export type CheckoutInputType = z.infer<typeof CheckoutInput>;
export type WebhookEventType = z.infer<typeof WebhookEvent>;
export type CheckoutResponseType = z.infer<typeof CheckoutResponse>;
export type BoostStatusResponseType = z.infer<typeof BoostStatusResponse>;
