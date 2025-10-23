import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import { buildPaginatedResponse } from '@/shared/utils/pagination';

export class TagsService {
  async listTags() {
    const tags = await db.tag.findMany({
      where: {
        status: 'active',
        deleted_at: null,
      },
      include: {
        _count: {
          select: {
            player_tags: {
              where: {
                status: 'active',
                deleted_at: null,
                player: {
                  status: 'active',
                  deleted_at: null,
                },
              },
            },
          },
        },
      },
      orderBy: { label: 'asc' },
    });

    return {
      success: true,
      data: tags.map(tag => ({
        id: tag.id,
        slug: tag.slug,
        label: tag.label,
        aliases: tag.aliases,
        players_count: tag._count.player_tags,
      })),
    };
  }

  async getPlayersByTag(
    slug: string,
    filters: {
      limit?: number;
      cursor?: string;
    }
  ) {
    // Validar formato do slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw E.NOT_FOUND({ entity: 'tag', slug });
    }

    // Validar tamanho do slug (máximo 255 caracteres)
    if (slug.length > 255) {
      throw E.NOT_FOUND({ entity: 'tag', slug });
    }

    // Verificar se a tag existe e está ativa
    const tag = await db.tag.findUnique({
      where: { slug },
    });

    if (!tag || tag.status !== 'active' || tag.deleted_at !== null) {
      throw E.NOT_FOUND({ entity: 'tag', slug });
    }

    const limit = Math.min(filters.limit ?? 20, 100);

    const players = await db.profile.findMany({
      where: {
        status: 'active',
        deleted_at: null,
        player_tags: {
          some: {
            tag_ref: {
              slug,
            },
            status: 'active',
            deleted_at: null,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
        player_tags: {
          include: { tag_ref: true },
        },
        _count: {
          select: {
            media: {
              where: {
                status: 'approved',
                deleted_at: null,
              },
            },
          },
        },
      },
      take: limit + 1,
      ...(filters.cursor && {
        skip: 1,
        cursor: { id: filters.cursor },
      }),
      orderBy: { created_at: 'desc' },
    });

    const hasNextPage = players.length > limit;
    const data = hasNextPage ? players.slice(0, limit) : players;

    return buildPaginatedResponse(data, limit, filters.cursor, hasNextPage);
  }
}
