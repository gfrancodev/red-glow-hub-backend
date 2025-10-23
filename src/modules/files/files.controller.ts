import { Router } from 'express';
import { FilesService } from './files.service';
import { PresignUploadInput } from './files.schema';
import { validate } from '@/shared/middleware/validate';
import { requireAuth } from '@/shared/middleware/auth';
import { asyncHandler } from '@/shared/core/http';

const router = Router();
const filesService = new FilesService();

// POST /files/presign
router.post(
  '/presign',
  requireAuth,
  validate({ body: PresignUploadInput }),
  asyncHandler(async (req, res) => {
    const result = await filesService.generatePresignedUrl(req.body);
    res.json(result);
  })
);

export default router;
