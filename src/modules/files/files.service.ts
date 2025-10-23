import { E } from '@/shared/errors';
import { R2Service } from '@/shared/services/r2.service';
import type { PresignUploadInputType, PresignUploadResponse } from './files.schema';

export class FilesService {
  private r2Service: R2Service;

  constructor() {
    this.r2Service = new R2Service();
  }

  async generatePresignedUrl(input: PresignUploadInputType): Promise<PresignUploadResponse> {
    // Validate file type based on kind
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];

    if (input.kind === 'media') {
      if (
        !allowedImageTypes.includes(input.content_type) &&
        !allowedVideoTypes.includes(input.content_type)
      ) {
        throw E.BAD_REQUEST({ meta: { field: 'content_type', value: input.content_type } });
      }
    } else if (input.kind === 'avatar') {
      if (!allowedImageTypes.includes(input.content_type)) {
        throw E.BAD_REQUEST({ meta: { field: 'content_type', value: input.content_type } });
      }
    }

    // Generate file key
    const fileKey = this.r2Service.generateKey(input.kind, input.file_name);

    // Generate presigned URL (1 hour expiry)
    const { url } = await this.r2Service.generatePresignedUrl(fileKey, input.content_type, 3600);

    // Generate public URL
    const publicUrl = this.r2Service.getPublicUrl(fileKey);

    return {
      success: true,
      data: {
        upload_url: url,
        file_key: fileKey,
        public_url: publicUrl,
        expires_in: 3600,
      },
    };
  }
}
