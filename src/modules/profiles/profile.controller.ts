import { asyncHandler } from '@/shared/core/http';
import { requireAuth, type AuthenticatedRequest } from '@/shared/middleware/auth';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { CreateMediaInput, MediaIdParam, UpdateMediaInput, UpdateProfileInput, UploadAvatarInput } from './profile.schema';
import { ProfileService } from './profile.service';

const router = Router();
const profileService = new ProfileService();

// GET /me/profile
router.get(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const profile = await profileService.getProfile(userId);
    res.json({ success: true, data: profile });
  })
);

// PUT /me/profile
router.put(
  '/profile',
  requireAuth,
  validate({ body: UpdateProfileInput }),
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const profile = await profileService.updateProfile(userId, req.body);
    res.json({ success: true, data: profile });
  })
);

// GET /me/media
router.get(
  '/media',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const media = await profileService.getMedia(userId, {
      type: req.query.type as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      cursor: req.query.cursor as string | undefined,
    });
    res.json({ success: true, data: media });
  })
);

// POST /me/media
router.post(
  '/media',
  requireAuth,
  validate({ body: CreateMediaInput }),
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const media = await profileService.createMedia(userId, req.body);
    res.status(201).json({ success: true, data: media });
  })
);

// PATCH /me/media/:media_id
router.patch(
  '/media/:media_id',
  requireAuth,
  validate({ body: UpdateMediaInput, params: MediaIdParam }),
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const mediaId = req.params.media_id as string;
    const media = await profileService.updateMedia(userId, mediaId, req.body);
    res.json({ success: true, data: media });
  })
);

// DELETE /me/media/:media_id
router.delete(
  '/media/:media_id',
  requireAuth,
  validate({ params: MediaIdParam }),
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const mediaId = req.params.media_id as string;
    await profileService.deleteMedia(userId, mediaId);
    res.json({ success: true });
  })
);

// POST /me/avatar/upload
router.post(
  '/avatar/upload',
  requireAuth,
  validate({ body: UploadAvatarInput }),
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const result = await profileService.uploadAvatar(userId, req.body);
    res.json({ success: true, data: result });
  })
);

// POST /me/avatar/confirm
router.post(
  '/avatar/confirm',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const { key } = req.body;
    
    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'PL-0400',
        error: {
          id: 'validation-error',
          status: 400,
          name: 'Bad Request',
          details: {
            timestamp: new Date().toISOString(),
            path: req.path,
            message: 'Key is required',
          },
        },
      });
    }

    const profile = await profileService.confirmAvatarUpload(userId, key);
    res.json({ success: true, data: profile });
  })
);

export default router;
