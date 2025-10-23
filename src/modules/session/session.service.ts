import type { SessionInfo } from '@/modules/auth/auth.types';
import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';

export class SessionService {
  async getSessionInfo(sessionId: string): Promise<SessionInfo> {
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (session?.status !== 'active' || session.expires_at < new Date()) {
      throw E.UNAUTHORIZED();
    }

    if (session.user.status !== 'active') {
      throw E.FORBIDDEN();
    }

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
        session: {
          id: session.id,
          expires_at: session.expires_at.toISOString(),
          created_at: session.created_at.toISOString(),
        },
      },
    };
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await db.session.update({
      where: { id: sessionId },
      data: { status: 'inactive' },
    });
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await db.session.updateMany({
      where: { user_id: userId },
      data: { status: 'inactive' },
    });
  }
}
