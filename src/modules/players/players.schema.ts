import { z } from 'zod';

export const ListPlayersQuery = z.object({
  q: z.string().optional().describe('Termo de busca'),
  state: z.string().optional().describe('Estado (UF)'),
  city: z.string().optional().describe('Cidade'),
  tags: z.array(z.string()).optional().describe('Tags para filtrar'),
  sort: z
    .enum(['created_at_desc', 'created_at_asc', 'boost_desc', 'trending'])
    .default('created_at_desc')
    .describe('Ordenação dos resultados'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default(() => 20)
    .describe('Número de resultados por página (máximo 100)'),
  cursor: z.string().optional().describe('Cursor para paginação'),
});

export const SearchQuery = z.object({
  q: z.string().min(1).describe('Termo de busca obrigatório'),
  type: z.enum(['players', 'tags', 'all']).default('all').describe('Tipo de busca'),
  state: z.string().optional().describe('Estado (UF)'),
  city: z.string().optional().describe('Cidade'),
  tags: z.array(z.string()).optional().describe('Tags para filtrar'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default(() => 20)
    .describe('Número de resultados por página (máximo 100)'),
  cursor: z.string().optional().describe('Cursor para paginação'),
});

export const TrendingQuery = z.object({
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .default(() => 20)
    .describe('Número de resultados por página (máximo 50)'),
  cursor: z.string().optional().describe('Cursor para paginação'),
});

// Response schemas
export const PlayerProfileResponse = z.object({
  id: z.string().describe('ID do player'),
  username: z.string().describe('Username'),
  display_name: z.string().describe('Nome de exibição'),
  bio: z.string().optional().describe('Biografia'),
  avatar_url: z.string().optional().describe('URL do avatar'),
  state: z.string().describe('Estado'),
  city: z.string().describe('Cidade'),
  city_slug: z.string().optional().describe('Slug da cidade'),
  contact_email: z.string().optional().describe('Email de contato'),
  whatsapp: z.string().optional().describe('WhatsApp'),
  twitch: z.string().optional().describe('Twitch'),
  youtube: z.string().optional().describe('YouTube'),
  instagram: z.string().optional().describe('Instagram'),
  featured_media_id: z.string().optional().describe('ID da mídia em destaque'),
  tags: z.array(z.string()).describe('Tags do player'),
  created_at: z.string().describe('Data de criação'),
  updated_at: z.string().describe('Data de atualização'),
});

export const ListPlayersResponse = z.object({
  success: z.boolean().default(true),
  data: z.array(PlayerProfileResponse),
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

export const SearchResponse = z.object({
  success: z.boolean().default(true),
  data: z.object({
    players: z.array(PlayerProfileResponse).describe('Players encontrados'),
    tags: z.array(z.object({
      slug: z.string().describe('Slug da tag'),
      label: z.string().describe('Nome da tag'),
      count: z.number().describe('Número de players com esta tag'),
    })).describe('Tags encontradas'),
  }),
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

export const TrendingResponse = z.object({
  success: z.boolean().default(true),
  data: z.array(PlayerProfileResponse),
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

export type ListPlayersQueryType = z.infer<typeof ListPlayersQuery>;
export type SearchQueryType = z.infer<typeof SearchQuery>;
export type TrendingQueryType = z.infer<typeof TrendingQuery>;
