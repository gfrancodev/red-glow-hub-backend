import { E } from '@/shared/errors';
import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from './auth';

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = (req as AuthenticatedRequest).user;
    const userRole = user.role;
    if (!roles.includes(userRole)) {
      return next(E.FORBIDDEN());
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireModerator = requireRole(['admin', 'moderator']);
export const requireCurator = requireRole(['admin', 'curator']);
export const requireSupport = requireRole(['admin', 'support']);
export const requireReadonly = requireRole([
  'admin',
  'moderator',
  'curator',
  'support',
  'readonly',
]);
