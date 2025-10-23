import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import { verifyAccessToken } from '@/shared/utils/tokens';
import type { Request, RequestHandler } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    user_id: string;
    role: string;
    session_id: string;
  };
}

export const verifyToken: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw E.UNAUTHORIZED();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Verify session is still active
    db.session
      .findUnique({
        where: { id: payload.session_id },
      })
      .then(session => {
        if (session?.status !== 'active' || session.expires_at < new Date()) {
          throw E.UNAUTHORIZED();
        }

        (req as unknown as AuthenticatedRequest).user = {
          user_id: payload.user_id,
          role: payload.role,
          session_id: payload.session_id,
        };

        next();
      })
      .catch(next);
  } catch (error) {
    next(error);
  }
};

export const requireAuth: RequestHandler = (req, res, next) => {
  verifyToken(req, res, next);
};

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = (req as unknown as AuthenticatedRequest).user;
    const userRole = user.role;
    if (!roles.includes(userRole)) {
      return next(E.FORBIDDEN());
    }

    next();
  };
};

// Middleware especial para logout que permite tokens inválidos
export const verifyTokenForLogout: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw E.UNAUTHORIZED();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Para logout, não verificamos se a sessão está ativa
    // Apenas extraímos o session_id para invalidar
    (req as unknown as AuthenticatedRequest).user = {
      user_id: payload.user_id,
      role: payload.role,
      session_id: payload.session_id,
    };

    next();
  } catch (error) {
    next(error);
  }
};
