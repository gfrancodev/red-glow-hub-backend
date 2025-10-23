import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import type { CallbackInputType, CallbackResponse } from './uploads.schema';

export class UploadsService {
  async processCallback(input: CallbackInputType): Promise<CallbackResponse> {
    // Find media record
    const media = await db.media.findUnique({
      where: { id: input.media_id },
    });

    if (!media) {
      throw E.NOT_FOUND({ media_id: input.media_id });
    }

    // Update media status and metadata
    const updatedMedia = await db.media.update({
      where: { id: input.media_id },
      data: {
        status: input.status === 'approved' ? 'approved' : 'rejected',
        width: input.metadata.width,
        height: input.metadata.height,
        duration_sec: input.metadata.duration,
        nsfw_score: input.metadata.nsfw_score,
        nsfw_labels: input.metadata.nsfw_labels,
        moderation_history: {
          status: input.status,
          reason: input.status === 'rejected' ? 'Content policy violation' : 'Approved',
          at: new Date().toISOString(),
          by_user_id: 'system',
        },
      },
    });

    return {
      success: true,
      data: {
        media_id: updatedMedia.id,
        status: updatedMedia.status,
        updated_at: updatedMedia.updated_at.toISOString(),
      },
    };
  }
}
