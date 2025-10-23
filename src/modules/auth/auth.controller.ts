import { asyncHandler } from '@/shared/core/http';
import { verifyTokenForLogout, type AuthenticatedRequest } from '@/shared/middleware/auth';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { LoginInput, LogoutInput, RefreshInput, SignupInput } from './auth.schema';
import { AuthService } from './auth.service';

const router = Router();
const authService = new AuthService();

// POST /auth/signup
router.post(
  '/signup',
  validate({ body: SignupInput }),
  asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  })
);

// POST /auth/login
router.post(
  '/login',
  validate({ body: LoginInput }),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  })
);

// POST /auth/refresh
router.post(
  '/refresh',
  validate({ body: RefreshInput }),
  asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body);
    res.json(result);
  })
);

// POST /auth/logout
router.post(
  '/logout',
  verifyTokenForLogout,
  validate({ body: LogoutInput }),
  asyncHandler(async (req, res) => {
    const sessionId = (req as AuthenticatedRequest).user.session_id;
    const result = await authService.logout(sessionId);
    res.json(result);
  })
);

export default router;
