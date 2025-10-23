import type { Prisma } from '@prisma/client';
import type { ZodError } from 'zod';
import { Exception } from './exception';

/* eslint-disable no-unused-vars */
type ToException = (err: unknown) => Exception | null;
/* eslint-enable no-unused-vars */

export const mapZod: ToException = err => {
  if (!err || typeof err !== 'object' || (err as { name?: string }).name !== 'ZodError')
    return null;
  const issues = (err as ZodError).issues.map(i => ({
    path: i.path.join('.'),
    message: i.message,
    code: i.code,
  }));
  return new Exception(
    {
      code: 'PL-0422',
      identifier: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed',
      status: 422,
    },
    { meta: { issues } }
  );
};

export const mapPrisma: ToException = err => {
  const e = err as Prisma.PrismaClientKnownRequestError;
  if (typeof e !== 'object') return null;
  // P2002 unique constraint
  if (e.code === 'P2002') {
    return new Exception(
      {
        code: 'PL-0409',
        identifier: 'CONFLICT',
        message: 'Unique constraint violation',
        status: 409,
      },
      { meta: { target: e.meta?.target } }
    );
  }
  // P2025 record not found
  if (e.code === 'P2025') {
    return new Exception({
      code: 'PL-0404',
      identifier: 'NOT_FOUND',
      message: 'Record not found',
      status: 404,
    });
  }
  return null;
};

export const mapJWT: ToException = err => {
  if (!err || typeof err !== 'object') return null;
  const name = (err as { name?: string }).name;
  if (name === 'JsonWebTokenError' || name === 'TokenExpiredError' || name === 'NotBeforeError') {
    return new Exception({
      code: 'PL-0401',
      identifier: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
      status: 401,
    });
  }
  return null;
};

/** Compose mappers (primeiro que casar, vence) */
export function mapToException(err: unknown): Exception | null {
  for (const m of [mapZod, mapPrisma, mapJWT]) {
    const ex = m(err);
    if (ex) return ex;
  }
  return null;
}
