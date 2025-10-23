import { z } from 'zod';

export const PresignUploadInput = z.object({
  file_name: z.string().min(1).max(255).describe('Nome do arquivo'),
  content_type: z.string().regex(/^(image|video)\//).describe('Tipo MIME do arquivo (image/* ou video/*)'),
  kind: z.enum(['media', 'avatar', 'banner']).describe('Tipo de arquivo'),
});

export const PresignUploadResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    upload_url: z.string().describe('URL pré-assinada para upload'),
    file_key: z.string().describe('Chave do arquivo no storage'),
    public_url: z.string().describe('URL pública do arquivo'),
    expires_in: z.number().describe('Tempo de expiração em segundos'),
  }),
});

export type PresignUploadInputType = z.infer<typeof PresignUploadInput>;
export type PresignUploadResponseType = z.infer<typeof PresignUploadResponse>;
