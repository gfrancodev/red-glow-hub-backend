import { CATALOG } from './catalog';
import { createExceptionKit } from './exception';

export const { raise } = createExceptionKit(CATALOG);

/** Exemplos de helpers prontos */
export const E = {
  INTERNAL: (meta?: Record<string, unknown>) => raise('INTERNAL_ERROR', { meta }),
  BAD_REQUEST: (meta?: Record<string, unknown>) => raise('BAD_REQUEST', { meta }),
  UNAUTHORIZED: () => raise('UNAUTHORIZED'),
  FORBIDDEN: () => raise('FORBIDDEN'),
  NOT_FOUND: (meta?: Record<string, unknown>) => raise('NOT_FOUND', { meta }),
  CONFLICT: (meta?: Record<string, unknown>) => raise('CONFLICT', { meta }),
  UNPROCESSABLE: (meta?: Record<string, unknown>) => raise('UNPROCESSABLE_ENTITY', { meta }),
};

export * from './types';
export * from './exception';
export * from './mappers';
export * from './catalog';
