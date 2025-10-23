import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import { hashPassword, verifyPassword } from '@/shared/utils/passwords';
import { createTokenPair, verifyRefreshToken } from '@/shared/utils/tokens';
import type { LoginInputType, RefreshInputType, SignupInputType } from './auth.schema';
import type { AuthResponse } from './auth.types';

export class AuthService {
  async signup(input: SignupInputType): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw E.CONFLICT({ field: 'email', value: input.email });
    }

    // Check if username already exists
    const existingProfile = await db.profile.findUnique({
      where: { username: input.username },
    });

    if (existingProfile) {
      throw E.CONFLICT({ field: 'username', value: input.username });
    }

    // Hash password
    const password_hash = await hashPassword(input.password);

    // Create user and profile in transaction
    const result = await db.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          password_hash,
          role: 'player',
          status: 'active',
        },
      });

      const profile = await tx.profile.create({
        data: {
          user_id: user.id,
          username: input.username,
          display_name: input.display_name,
          state: input.state,
          city: input.city,
          city_slug: input.city_slug,
          status: 'active',
        },
      });

      return { user, profile };
    });

    // Create session
    const session = await db.session.create({
      data: {
        user_id: result.user.id,
        session_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create tokens
    const tokens = createTokenPair({
      user_id: result.user.id,
      role: result.user.role,
      session_id: session.id,
    });

    return {
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          profile: {
            id: result.profile.id,
            username: result.profile.username,
            display_name: result.profile.display_name,
            state: result.profile.state,
            city: result.profile.city,
            city_slug: result.profile.city_slug ?? undefined,
            bio: result.profile.bio ?? undefined,
            contact_email: result.profile.contact_email ?? undefined,
            whatsapp: result.profile.whatsapp ?? undefined,
            twitch: result.profile.twitch ?? undefined,
            youtube: result.profile.youtube ?? undefined,
            instagram: result.profile.instagram ?? undefined,
            featured_media_id: result.profile.featured_media_id ?? undefined,
            status: result.profile.status,
            created_at: result.profile.created_at.toISOString(),
            updated_at: result.profile.updated_at.toISOString(),
          },
        },
        tokens,
      },
    };
  }

  async login(input: LoginInputType): Promise<AuthResponse> {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email: input.email },
      include: { profile: true },
    });

    if (!user) {
      throw E.UNAUTHORIZED();
    }

    // Verify password
    const isValidPassword = await verifyPassword(input.password, user.password_hash);
    if (!isValidPassword) {
      throw E.UNAUTHORIZED();
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw E.UNAUTHORIZED();
    }

    // Create session
    const session = await db.session.create({
      data: {
        user_id: user.id,
        session_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create tokens
    const tokens = createTokenPair({
      user_id: user.id,
      role: user.role,
      session_id: session.id,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          profile: user.profile
            ? {
                id: user.profile.id,
                username: user.profile.username,
                display_name: user.profile.display_name,
                state: user.profile.state,
                city: user.profile.city,
                city_slug: user.profile.city_slug ?? undefined,
                bio: user.profile.bio ?? undefined,
                contact_email: user.profile.contact_email ?? undefined,
                whatsapp: user.profile.whatsapp ?? undefined,
                twitch: user.profile.twitch ?? undefined,
                youtube: user.profile.youtube ?? undefined,
                instagram: user.profile.instagram ?? undefined,
                featured_media_id: user.profile.featured_media_id ?? undefined,
                status: user.profile.status,
                created_at: user.profile.created_at.toISOString(),
                updated_at: user.profile.updated_at.toISOString(),
              }
            : undefined,
        },
        tokens,
      },
    };
  }

  async refresh(input: RefreshInputType): Promise<AuthResponse> {
    // Verify refresh token
    const payload = verifyRefreshToken(input.refresh_token);

    // Find session
    const session = await db.session.findUnique({
      where: { id: payload.session_id },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (session?.status !== 'active' || session.expires_at < new Date()) {
      throw E.UNAUTHORIZED();
    }

    // Check if user is still active
    if (session.user.status !== 'active') {
      throw E.UNAUTHORIZED();
    }

    // Create new session
    const newSession = await db.session.create({
      data: {
        user_id: session.user_id,
        session_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Invalidate old session (idempotent)
    await db.session.updateMany({
      where: { id: session.id },
      data: { status: 'inactive' },
    });

    // Create new tokens
    const tokens = createTokenPair({
      user_id: session.user.id,
      role: session.user.role,
      session_id: newSession.id,
    });

    return {
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          status: session.user.status,
          profile: session.user.profile
            ? {
                id: session.user.profile.id,
                username: session.user.profile.username,
                display_name: session.user.profile.display_name,
                state: session.user.profile.state,
                city: session.user.profile.city,
                city_slug: session.user.profile.city_slug ?? undefined,
                bio: session.user.profile.bio ?? undefined,
                contact_email: session.user.profile.contact_email ?? undefined,
                whatsapp: session.user.profile.whatsapp ?? undefined,
                twitch: session.user.profile.twitch ?? undefined,
                youtube: session.user.profile.youtube ?? undefined,
                instagram: session.user.profile.instagram ?? undefined,
                featured_media_id: session.user.profile.featured_media_id ?? undefined,
                status: session.user.profile.status,
                created_at: session.user.profile.created_at.toISOString(),
                updated_at: session.user.profile.updated_at.toISOString(),
              }
            : undefined,
        },
        tokens,
      },
    };
  }

  async logout(sessionId: string): Promise<{ success: boolean }> {
    // Invalidate session (idempotent - não falha se já estiver inativa)
    await db.session.updateMany({
      where: {
        id: sessionId,
        status: 'active', // Só atualiza se ainda estiver ativa
      },
      data: { status: 'inactive' },
    });

    // Sempre retorna sucesso, mesmo se a sessão já estava inativa
    return { success: true };
  }
}
