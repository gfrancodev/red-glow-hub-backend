import db from '@/shared/config/db.config';

export class LocationsService {
  async getStates() {
    const states = await db.profile.findMany({
      where: {
        status: 'active',
      },
      select: {
        state: true,
      },
      distinct: ['state'],
      orderBy: { state: 'asc' },
    });

    return {
      success: true,
      data: states.map(s => s.state),
    };
  }

  async getCitiesByState(state: string) {
    const cities = await db.profile.findMany({
      where: {
        state,
        status: 'active',
      },
      select: {
        city: true,
        city_slug: true,
      },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    return {
      success: true,
      data: cities.map(c => ({
        name: c.city,
        slug: c.city_slug,
      })),
    };
  }

  async getPlayersByLocation(
    state: string,
    city: string,
    filters: {
      limit?: number;
      cursor?: string;
    }
  ) {
    const limit = Math.min(filters.limit ?? 20, 100);

    const players = await db.profile.findMany({
      where: {
        state,
        city: { contains: city, mode: 'insensitive' },
        status: 'active',
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

    return {
      success: true,
      data,
      meta: {
        limit,
        in_page: data.length,
        has_next_page: hasNextPage,
        has_previous_page: !!filters.cursor,
        next_cursor: hasNextPage && data.length > 0 ? data[data.length - 1]?.id : undefined,
      },
    };
  }
}
