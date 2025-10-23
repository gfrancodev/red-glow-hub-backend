import db from '@/shared/config/db.config';
import type { profile, user, user_role, user_status } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<(user & { profile: profile | null }) | null> {
    return await db.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: string): Promise<(user & { profile: profile | null }) | null> {
    return await db.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findByUsername(username: string): Promise<(profile & { user: user }) | null> {
    return await db.profile.findUnique({
      where: { username },
      include: { user: true },
    });
  }

  async create(data: {
    email: string;
    password_hash: string;
    role?: user_role;
    status?: user_status;
  }): Promise<user> {
    return await db.user.create({
      data: {
        email: data.email,
        password_hash: data.password_hash,
        role: data.role ?? 'player',
        status: data.status ?? 'active',
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      password_hash: string;
      role: string;
      status: string;
    }>
  ): Promise<user> {
    return await db.user.update({
      where: { id },
      data: data as Partial<user>,
    });
  }

  async delete(id: string): Promise<user> {
    return await db.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async search(filters: {
    email?: string;
    username?: string;
    state?: string;
    city?: string;
    tags?: string[];
    status?: string;
    role?: string;
    limit?: number;
    cursor?: string;
  }) {
    const where: Record<string, unknown> = {
      deleted_at: null,
    };

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.username || filters.state || filters.city || filters.tags) {
      where.profile = {
        deleted_at: null,
        ...(filters.username && { username: { contains: filters.username, mode: 'insensitive' } }),
        ...(filters.state && { state: filters.state }),
        ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
        ...(filters.tags && {
          player_tags: {
            some: {
              tag_ref: {
                slug: { in: filters.tags },
              },
            },
          },
        }),
      };
    }

    const users = await db.user.findMany({
      where,
      include: {
        profile: {
          include: {
            player_tags: {
              include: { tag_ref: true },
            },
          },
        },
      },
      take: filters.limit ?? 20,
      ...(filters.cursor && {
        skip: 1,
        cursor: { id: filters.cursor },
      }),
      orderBy: { created_at: 'desc' },
    });

    return users;
  }
}
