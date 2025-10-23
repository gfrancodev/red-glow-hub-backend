import { asyncHandler } from '@/shared/core/http';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { CallbackInput } from './uploads.schema';
import { UploadsService } from './uploads.service';

const router = Router();
const uploadsService = new UploadsService();

// POST /uploads/callback
router.post(
  '/callback',
  validate({ body: CallbackInput }),
  asyncHandler(async (req, res) => {
    const result = await uploadsService.processCallback(req.body);
    res.json(result);
  })
);

export default router;
