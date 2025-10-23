import { z } from 'zod';

export const CallbackInput = z.object({
  media_id: z.string().min(1).describe('ID da mídia'),
  status: z.enum(['approved', 'rejected']).describe('Status da aprovação'),
  metadata: z.object({
    file_key: z.string().min(1).describe('Chave do arquivo no storage'),
    file_size: z.number().optional().describe('Tamanho do arquivo em bytes'),
    width: z.number().optional().describe('Largura da imagem/vídeo'),
    height: z.number().optional().describe('Altura da imagem/vídeo'),
    duration: z.number().optional().describe('Duração do vídeo em segundos'),
    nsfw_score: z.number().optional().describe('Score NSFW (0-1)'),
    nsfw_labels: z.array(z.string()).optional().describe('Labels NSFW detectadas'),
  }),
});

export const CallbackResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    media_id: z.string().describe('ID da mídia'),
    status: z.string().describe('Status da mídia'),
    updated_at: z.string().describe('Data de atualização'),
  }),
});

export type CallbackInputType = z.infer<typeof CallbackInput>;
export type CallbackResponseType = z.infer<typeof CallbackResponse>;
