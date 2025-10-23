import { ProfileService } from '@/modules/profiles/profile.service';
import { buildPaginatedResponse } from '@/shared/utils/pagination';
import type { ListPlayersQueryType, SearchQueryType, TrendingQueryType } from './players.schema';

export class PlayersService {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  async listPlayers(query: ListPlayersQueryType) {
    const { limit, cursor, ...filters } = query;

    const profiles = await this.profileService.search({
      ...filters,
      status: 'active',
      limit: limit + 1, // Get one extra to check if there's a next page
      cursor,
    });

    const hasNextPage = profiles.length > limit;
    const data = hasNextPage ? profiles.slice(0, limit) : profiles;

    return buildPaginatedResponse(data, limit, cursor, hasNextPage);
  }

  async search(query: SearchQueryType) {
    const { limit, cursor, type, ...filters } = query;

    if (type === 'players' || type === 'all') {
      const profiles = await this.profileService.search({
        ...filters,
        status: 'active',
        limit: limit + 1,
        cursor,
      });

      const hasNextPage = profiles.length > limit;
      const data = hasNextPage ? profiles.slice(0, limit) : profiles;

      return buildPaginatedResponse(data, limit, cursor, hasNextPage);
    }

    // TODO: Implement tag search when tags module is ready
    return buildPaginatedResponse([], limit, cursor, false);
  }

  async getTrending(query: TrendingQueryType) {
    const { limit, cursor } = query;

    // For now, return most recent profiles
    // TODO: Implement actual trending algorithm based on views, likes, etc.
    const profiles = await this.profileService.search({
      status: 'active',
      limit: limit + 1,
      cursor,
    });

    const hasNextPage = profiles.length > limit;
    const data = hasNextPage ? profiles.slice(0, limit) : profiles;

    return buildPaginatedResponse(data, limit, cursor, hasNextPage);
  }

  async getPlayerByUsername(username: string) {
    return await this.profileService.getPublicProfile(username);
  }

  async getPlayerMedia(
    username: string,
    filters: {
      type?: string;
      limit?: number;
      cursor?: string;
    }
  ) {
    return await this.profileService.getPublicMedia(username, filters);
  }
}
