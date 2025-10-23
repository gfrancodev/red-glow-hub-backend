import { z } from 'zod';

export const ContactInput = z.object({
  channel: z.enum(['email', 'whatsapp', 'twitch', 'youtube', 'instagram', 'other'])
    .describe('Canal de contato preferido'),
  message: z.string().min(1).max(1000).describe('Mensagem de contato (1-1000 caracteres)'),
  hcaptcha_token: z.string().optional().describe('Token hCaptcha para verificação'),
});

export const ContactResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    contact_id: z.string().describe('ID do contato criado'),
    status: z.string().describe('Status do contato'),
    created_at: z.string().describe('Data de criação'),
  }),
});

export type ContactInputType = z.infer<typeof ContactInput>;
export type ContactResponseType = z.infer<typeof ContactResponse>;
