import type { JWTPayload, TokenPair } from '@/shared/utils/tokens';

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      profile?: {
        id: string;
        username: string;
        display_name: string;
        state: string;
        city: string;
        city_slug?: string;
        bio?: string;
        contact_email?: string;
        whatsapp?: string;
        twitch?: string;
        youtube?: string;
        instagram?: string;
        featured_media_id?: string;
        status: string;
        created_at: string;
        updated_at: string;
      };
    };
    tokens: TokenPair;
  };
}

export interface SessionInfo {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      profile?: {
        id: string;
        username: string;
        display_name: string;
        state: string;
        city: string;
        city_slug?: string;
        bio?: string;
        contact_email?: string;
        whatsapp?: string;
        twitch?: string;
        youtube?: string;
        instagram?: string;
        featured_media_id?: string;
        status: string;
        created_at: string;
        updated_at: string;
      };
    };
    session: {
      id: string;
      expires_at: string;
      created_at: string;
    };
  };
}

export { type JWTPayload, type TokenPair };
