import { z } from 'zod';

// Schema para validação de parâmetros da rota /tags/:slug/players
export const getPlayersByTagParamsSchema = z.object({
  slug: z.string()
    .min(1, 'Slug é obrigatório')
    .max(1000, 'Slug muito longo')
    .describe('Slug da tag para buscar players'),
});

// Schema para validação de query parameters da rota /tags/:slug/players
export const getPlayersByTagQuerySchema = z.object({
  limit: z.string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) return undefined;
      return Math.min(parsed, 100); // Limite máximo de 100
    })
    .default(20)
    .describe('Número de resultados por página (máximo 100)'),
  cursor: z.string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      return val.trim();
    })
    .describe('Cursor para paginação'),
});

// Schema para validação de query parameters da rota /tags
export const listTagsQuerySchema = z.object({
  // Por enquanto não há query parameters para listar tags
  // Mas pode ser expandido no futuro
});

// Response schemas
export const TagResponse = z.object({
  id: z.string().describe('ID da tag'),
  slug: z.string().describe('Slug da tag'),
  label: z.string().describe('Nome da tag'),
  aliases: z.array(z.string()).describe('Aliases da tag'),
  status: z.string().describe('Status da tag'),
  created_at: z.string().describe('Data de criação'),
});

export const ListTagsResponse = z.object({
  success: z.boolean().default(true),
  data: z.array(TagResponse),
});

export const PlayerResponse = z.object({
  id: z.string().describe('ID do player'),
  username: z.string().describe('Username do player'),
  display_name: z.string().describe('Nome de exibição'),
  bio: z.string().optional().describe('Biografia'),
  avatar_url: z.string().optional().describe('URL do avatar'),
  state: z.string().describe('Estado'),
  city: z.string().describe('Cidade'),
  tags_count: z.number().optional().describe('Número de tags'),
  created_at: z.string().describe('Data de criação'),
});

export const GetPlayersByTagResponse = z.object({
  success: z.boolean().default(true),
  data: z.array(PlayerResponse),
  pagination: z.object({
    total_items: z.number().describe('Total de itens'),
    total_pages: z.number().describe('Total de páginas'),
    current_page: z.number().describe('Página atual'),
    limit: z.number().describe('Limite por página'),
    in_page: z.number().describe('Itens na página atual'),
    has_next_page: z.boolean().describe('Tem próxima página'),
    has_previous_page: z.boolean().describe('Tem página anterior'),
  }),
});

// Tipos TypeScript derivados dos schemas
export type GetPlayersByTagParams = z.infer<typeof getPlayersByTagParamsSchema>;
export type GetPlayersByTagQuery = z.infer<typeof getPlayersByTagQuerySchema>;
export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;

