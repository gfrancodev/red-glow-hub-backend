import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import type { ExceptionConfig, ErrorFormat } from './types';

export const ERROR_CATALOG = [
  // 4xx
  {
    code: 'PL-0400',
    identifier: 'BAD_REQUEST',
    message: 'Invalid request',
    status: StatusCodes.BAD_REQUEST,
  },
  {
    code: 'PL-0401',
    identifier: 'UNAUTHORIZED',
    message: 'Authentication required',
    status: StatusCodes.UNAUTHORIZED,
  },
  { code: 'PL-0403', identifier: 'FORBIDDEN', message: 'Forbidden', status: StatusCodes.FORBIDDEN },
  {
    code: 'PL-0404',
    identifier: 'NOT_FOUND',
    message: 'Resource not found',
    status: StatusCodes.NOT_FOUND,
  },
  {
    code: 'PL-0422',
    identifier: 'UNPROCESSABLE_ENTITY',
    message: 'Validation failed',
    status: StatusCodes.UNPROCESSABLE_ENTITY,
  },

  // Conflitos / dominio
  { code: 'PL-0409', identifier: 'CONFLICT', message: 'Conflict', status: StatusCodes.CONFLICT },

  // 5xx
  {
    code: 'PL-0500',
    identifier: 'INTERNAL_ERROR',
    message: 'Internal Server Error',
    status: StatusCodes.INTERNAL_SERVER_ERROR,
  },
  {
    code: 'PL-0503',
    identifier: 'SERVICE_UNAVAILABLE',
    message: 'Service unavailable',
    status: StatusCodes.SERVICE_UNAVAILABLE,
  },
] as const satisfies readonly ErrorFormat[];

export type AppErrorIds = (typeof ERROR_CATALOG)[number]['identifier'];

export const CATALOG: ExceptionConfig<typeof ERROR_CATALOG> = { errors: ERROR_CATALOG };

export function httpName(status: number) {
  try {
    return getReasonPhrase(status);
  } catch {
    return 'Unknown Error';
  }
}
