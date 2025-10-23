import { z } from 'zod';

export const UpdateProfileInput = z.object({
  display_name: z.string().min(1).max(100).optional().describe('Nome de exibição'),
  bio: z.string().max(500).optional().describe('Biografia'),
  avatar_url: z.string().url().optional().describe('URL do avatar'),
  state: z.string().length(2).optional().describe('Estado (UF)'),
  city: z.string().min(1).max(100).optional().describe('Cidade'),
  city_slug: z.string().optional().describe('Slug da cidade'),
  contact_email: z.string().email().optional().describe('Email de contato'),
  whatsapp: z.string().optional().describe('WhatsApp'),
  twitch: z.string().optional().describe('Twitch'),
  youtube: z.string().optional().describe('YouTube'),
  instagram: z.string().optional().describe('Instagram'),
  featured_media_id: z.string().optional().describe('ID da mídia em destaque'),
});

export const CreateMediaInput = z.object({
  type: z.enum(['image', 'video']).describe('Tipo da mídia'),
  source: z.enum(['upload', 'external']).default('upload').describe('Fonte da mídia'),
  url: z.string().url().describe('URL da mídia'),
  poster_url: z.string().url().optional().describe('URL do poster (para vídeos)'),
  blur_data_url: z.string().optional().describe('Data URL do blur (para imagens)'),
  width: z.number().optional().describe('Largura da mídia'),
  height: z.number().optional().describe('Altura da mídia'),
  duration_sec: z.number().optional().describe('Duração em segundos (para vídeos)'),
  focal_point_x: z.number().min(0).max(100).optional().describe('Ponto focal X (0-100)'),
  focal_point_y: z.number().min(0).max(100).optional().describe('Ponto focal Y (0-100)'),
  title: z.string().max(200).optional().describe('Título da mídia'),
  tags: z.array(z.string()).optional().describe('Tags da mídia'),
});

export const UpdateMediaInput = z.object({
  title: z.string().max(200).optional().describe('Título da mídia'),
  focal_point_x: z.number().min(0).max(100).optional().describe('Ponto focal X (0-100)'),
  focal_point_y: z.number().min(0).max(100).optional().describe('Ponto focal Y (0-100)'),
  tags: z.array(z.string()).optional().describe('Tags da mídia'),
});

// Schema para upload de avatar
export const UploadAvatarInput = z.object({
  file_name: z.string().min(1).max(255).describe('Nome do arquivo'),
  content_type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image format')
    .describe('Tipo MIME da imagem'),
});

// Schema para validação de parâmetros de rota
export const MediaIdParam = z.object({
  media_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID format')
    .describe('ID da mídia (formato ObjectId)'),
});

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInput>;
export type CreateMediaInputType = z.infer<typeof CreateMediaInput>;
export type UpdateMediaInputType = z.infer<typeof UpdateMediaInput>;
export type UploadAvatarInputType = z.infer<typeof UploadAvatarInput>;
export type MediaIdParamType = z.infer<typeof MediaIdParam>;
