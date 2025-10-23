import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import type { media, profile } from '@prisma/client';

// Interfaces para o resultado da agregação do MongoDB
interface MongoDate {
  $date: string;
}

interface MongoProfile {
  _id: string;
  username: string;
  display_name: string;
  bio?: string;
  state: string;
  city: string;
  city_slug?: string;
  contact_email?: string;
  whatsapp?: string;
  twitch?: string;
  youtube?: string;
  instagram?: string;
  featured_media_id?: string;
  tags_count?: number;
  status: string;
  created_at: MongoDate | Date;
  updated_at: MongoDate | Date;
  deleted_at?: MongoDate | Date | null;
}

// Type guard para verificar se é um MongoDate
function isMongoDate(date: MongoDate | Date | null): date is MongoDate {
  return date !== null && typeof date === 'object' && '$date' in date;
}

interface MongoAggregationResult {
  cursor: {
    firstBatch: MongoProfile[];
  };
}

export class ProfileRepository {
  async findById(
    id: string
  ): Promise<
    (profile & { user: { id: string; email: string; role: string; status: string } }) | null
  > {
    return db.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async findByUsername(
    username: string
  ): Promise<
    (profile & { user: { id: string; email: string; role: string; status: string } }) | null
  > {
    return db.profile.findUnique({
      where: { username },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async findByUserId(
    userId: string
  ): Promise<
    (profile & { user: { id: string; email: string; role: string; status: string } }) | null
  > {
    return db.profile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      display_name: string;
      bio: string | null;
      avatar_url: string | null;
      state: string;
      city: string;
      city_slug: string | null;
      contact_email: string | null;
      whatsapp: string | null;
      twitch: string | null;
      youtube: string | null;
      instagram: string | null;
      featured_media_id: string | null;
    }>
  ): Promise<profile> {
    return db.profile.update({
      where: { id },
      data,
    });
  }

  async getMedia(
    profileId: string,
    filters: {
      type?: string;
      status?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<media[]> {
    const where: Record<string, unknown> = {
      player_id: profileId,
      deleted_at: null,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return db.media.findMany({
      where,
      take: filters.limit ?? 20,
      ...(filters.cursor && {
        skip: 1,
        cursor: { id: filters.cursor },
      }),
      orderBy: { created_at: 'desc' },
    });
  }

  async createMedia(
    profileId: string,
    data: {
      type: string;
      source: string;
      url: string;
      poster_url?: string | null;
      blur_data_url?: string | null;
      width?: number | null;
      height?: number | null;
      duration_sec?: number | null;
      focal_point_x?: number | null;
      focal_point_y?: number | null;
      title?: string | null;
      tags_cache?: string[];
    }
  ): Promise<media> {
    return db.media.create({
      data: {
        player_id: profileId,
        ...data,
        type: data.type as 'image' | 'video',
        source: data.source as 'upload' | 'external',
      },
    });
  }

  async updateMedia(
    mediaId: string,
    profileId: string,
    data: {
      title?: string | null;
      focal_point_x?: number | null;
      focal_point_y?: number | null;
      tags_cache?: string[];
    }
  ): Promise<media> {
    return db.media.update({
      where: {
        id: mediaId,
        player_id: profileId,
      },
      data,
    });
  }

  async deleteMedia(mediaId: string, profileId: string): Promise<media> {
    // Primeiro verificar se a mídia existe e pertence ao perfil
    const existingMedia = await db.media.findFirst({
      where: {
        id: mediaId,
        player_id: profileId,
      },
    });

    if (!existingMedia) {
      throw E.NOT_FOUND({ entity: 'media', media_id: mediaId });
    }

    // Verificar se já foi deletada
    if (existingMedia.deleted_at !== null) {
      throw E.NOT_FOUND({ entity: 'media', media_id: mediaId });
    }

    return db.media.update({
      where: {
        id: mediaId,
        player_id: profileId,
      },
      data: { deleted_at: new Date() },
    });
  }

  async search(filters: {
    q?: string;
    state?: string;
    city?: string;
    tags?: string[];
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const where: Record<string, unknown> = {
      deleted_at: null,
    };

    // Debug: log the filters and where clause
    // eslint-disable-next-line no-console
    console.log('ProfileRepository.search - filters:', filters);
    // eslint-disable-next-line no-console
    console.log('ProfileRepository.search - initial where:', where);

    if (filters.q) {
      where.OR = [
        { username: { contains: filters.q, mode: 'insensitive' } },
        { display_name: { contains: filters.q, mode: 'insensitive' } },
        { bio: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.state) {
      where.state = filters.state;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.tags) {
      where.player_tags = {
        some: {
          tag_ref: {
            slug: { in: filters.tags },
          },
        },
      };
    }

    // eslint-disable-next-line no-console
    console.log('ProfileRepository.search - final where:', JSON.stringify(where, null, 2));

    // Teste simples primeiro - buscar todos os profiles sem filtros
    const allProfiles = await db.profile.findMany({
      select: {
        id: true,
        username: true,
        status: true,
        deleted_at: true,
        created_at: true,
      },
      take: 5,
    });
    // eslint-disable-next-line no-console
    console.log('ProfileRepository.search - all profiles (test):', allProfiles);

    // Usar consulta raw do MongoDB para evitar problemas com Prisma
    const matchStage: Record<string, unknown> = {
      deleted_at: null,
      status: 'active',
    };

    // Aplicar filtros
    if (filters.q) {
      matchStage.$or = [
        { username: { $regex: filters.q, $options: 'i' } },
        { display_name: { $regex: filters.q, $options: 'i' } },
        { bio: { $regex: filters.q, $options: 'i' } },
      ];
    }

    if (filters.state) {
      matchStage.state = filters.state;
    }

    if (filters.city) {
      matchStage.city = { $regex: filters.city, $options: 'i' };
    }

    if (filters.status) {
      matchStage.status = filters.status;
    }

    const profiles = (await db.$runCommandRaw({
      aggregate: 'profile',
      cursor: {},
      pipeline: [
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $match: matchStage as any, // MongoDB aggregation pipeline type not fully supported by Prisma
        },
        {
          $sort: { created_at: -1 },
        },
        {
          $limit: (filters.limit ?? 20) + 1,
        },
        {
          $project: {
            _id: 1,
            username: 1,
            display_name: 1,
            bio: 1,
            state: 1,
            city: 1,
            city_slug: 1,
            contact_email: 1,
            whatsapp: 1,
            twitch: 1,
            youtube: 1,
            instagram: 1,
            featured_media_id: 1,
            tags_count: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            deleted_at: 1,
          },
        },
      ],
    })) as unknown as MongoAggregationResult;

    // Converter o resultado para o formato esperado
    const profilesArray = profiles.cursor.firstBatch;

    // eslint-disable-next-line no-console
    console.log('ProfileRepository.search - found profiles:', profilesArray.length);
    // eslint-disable-next-line no-console
    console.log(
      'ProfileRepository.search - profiles:',
      profilesArray.map(p => ({
        id: p._id,
        username: p.username,
        status: p.status,
        deleted_at: p.deleted_at,
        created_at: p.created_at,
      }))
    );

    // Converter o formato dos dados para o formato esperado pelo Prisma
    const convertedProfiles = profilesArray.map((profile: MongoProfile) => ({
      ...profile,
      id: profile._id,
      created_at: isMongoDate(profile.created_at)
        ? new Date(profile.created_at.$date)
        : profile.created_at,
      updated_at: isMongoDate(profile.updated_at)
        ? new Date(profile.updated_at.$date)
        : profile.updated_at,
      deleted_at:
        profile.deleted_at && isMongoDate(profile.deleted_at)
          ? new Date(profile.deleted_at.$date)
          : profile.deleted_at,
    }));

    return convertedProfiles;
  }
}
