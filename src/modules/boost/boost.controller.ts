import { asyncHandler } from '@/shared/core/http';
import { requireAuth, type AuthenticatedRequest } from '@/shared/middleware/auth';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { CheckoutInput } from './boost.schema';
import { BoostService } from './boost.service';

const router = Router();
const boostService = new BoostService();

// POST /me/boost/checkout
router.post(
  '/checkout',
  requireAuth,
  validate({ body: CheckoutInput }),
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const result = await boostService.initiateCheckout(userId, req.body);
    res.status(201).json(result);
  })
);

// GET /me/boost
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.user_id;
    const result = await boostService.getBoosts(userId);
    res.json(result);
  })
);

export default router;
