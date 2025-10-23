import { z } from 'zod';

export const CreateReportInput = z.object({
  target_type: z.enum(['media', 'profile', 'user']).describe('Tipo do alvo da denúncia'),
  target_id: z.string().min(1).describe('ID do alvo da denúncia'),
  reason: z.enum(['abuse', 'harassment', 'spam', 'fraud', 'nsfw', 'illegal', 'other'])
    .describe('Motivo da denúncia'),
  details: z.string().max(1000).optional().describe('Detalhes adicionais (opcional)'),
  hcaptcha_token: z.string().optional().describe('Token hCaptcha para verificação'),
});

export const CreateReportResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    report_id: z.string().describe('ID da denúncia criada'),
    status: z.string().describe('Status da denúncia'),
    created_at: z.string().describe('Data de criação'),
  }),
});

export type CreateReportInputType = z.infer<typeof CreateReportInput>;
export type CreateReportResponseType = z.infer<typeof CreateReportResponse>;
