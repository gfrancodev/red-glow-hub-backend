import { asyncHandler } from '@/shared/core/http';
import { requireAuth, type AuthenticatedRequest } from '@/shared/middleware/auth';
import { Router } from 'express';
import { SessionService } from './session.service';

const router = Router();
const sessionService = new SessionService();

// GET /session
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessionId = (req as AuthenticatedRequest).user.session_id;
    const result = await sessionService.getSessionInfo(sessionId);
    res.json(result);
  })
);

export default router;
