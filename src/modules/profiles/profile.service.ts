import { E } from '@/shared/errors';
import { R2Service } from '@/shared/services/r2.service';
import { ProfileRepository } from './profile.repository';
import type {
    CreateMediaInputType,
    UpdateMediaInputType,
    UpdateProfileInputType,
    UploadAvatarInputType,
} from './profile.schema';

export class ProfileService {
  private profileRepo: ProfileRepository;
  private r2Service: R2Service;

  constructor() {
    this.profileRepo = new ProfileRepository();
    this.r2Service = new R2Service();
  }

  async getProfile(userId: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }
    return profile;
  }

  async updateProfile(userId: string, input: UpdateProfileInputType) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }

    return this.profileRepo.update(profile.id, input);
  }

  async getMedia(
    userId: string,
    filters: {
      type?: string;
      status?: string;
      limit?: number;
      cursor?: string;
    }
  ) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }

    return this.profileRepo.getMedia(profile.id, filters);
  }

  async createMedia(userId: string, input: CreateMediaInputType) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }

    return this.profileRepo.createMedia(profile.id, {
      type: input.type,
      source: input.source,
      url: input.url,
      poster_url: input.poster_url,
      blur_data_url: input.blur_data_url,
      width: input.width,
      height: input.height,
      duration_sec: input.duration_sec,
      focal_point_x: input.focal_point_x,
      focal_point_y: input.focal_point_y,
      title: input.title,
      tags_cache: input.tags ?? [],
    });
  }

  async updateMedia(userId: string, mediaId: string, input: UpdateMediaInputType) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }

    return this.profileRepo.updateMedia(mediaId, profile.id, {
      title: input.title,
      focal_point_x: input.focal_point_x,
      focal_point_y: input.focal_point_y,
      tags_cache: input.tags,
    });
  }

  async deleteMedia(userId: string, mediaId: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ entity: 'profile', user_id: userId });
    }

    return this.profileRepo.deleteMedia(mediaId, profile.id);
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
    return this.profileRepo.search(filters);
  }

  async getPublicProfile(username: string) {
    const profile = await this.profileRepo.findByUsername(username);
    if (profile?.status !== 'active') {
      throw E.NOT_FOUND({ meta: { entity: 'profile', username } });
    }

    return profile;
  }

  async getPublicMedia(
    username: string,
    filters: {
      type?: string;
      limit?: number;
      cursor?: string;
    }
  ) {
    const profile = await this.profileRepo.findByUsername(username);
    if (profile?.status !== 'active') {
      throw E.NOT_FOUND({ meta: { entity: 'profile', username } });
    }

    return this.profileRepo.getMedia(profile.id, {
      ...filters,
      status: 'approved',
    });
  }

  async uploadAvatar(userId: string, input: UploadAvatarInputType) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ entity: 'profile', user_id: userId });
    }

    // Gerar chave única para o avatar
    const key = this.r2Service.generateKey('avatars', input.file_name);
    
    // Gerar URL pré-assinada para upload
    const { url } = await this.r2Service.generatePresignedUrl(
      key,
      input.content_type,
      3600 // 1 hora
    );

    return {
      upload_url: url,
      key,
      public_url: this.r2Service.getPublicUrl(key),
    };
  }

  async confirmAvatarUpload(userId: string, key: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw E.NOT_FOUND({ entity: 'profile', user_id: userId });
    }

    // Atualizar o perfil com a nova URL do avatar
    const publicUrl = this.r2Service.getPublicUrl(key);
    return this.profileRepo.update(profile.id, {
      avatar_url: publicUrl,
    });
  }
}
