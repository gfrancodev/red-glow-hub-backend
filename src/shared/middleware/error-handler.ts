import { logger } from '@/shared/core/logger';
import { CATALOG, httpName } from '@/shared/errors/catalog';
import { Exception } from '@/shared/errors/exception';
import { mapToException } from '@/shared/errors/mappers';
import type { ErrorResponse } from '@/shared/errors/types';
import type { NextFunction, Request, Response } from 'express';
import { getReasonPhrase } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

/** Produz o payload final em TODOS os casos */
export function errorInterceptor(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let ex: Exception;

  // 1) Se já é nossa Exception, usa direto
  if (err instanceof Exception) {
    ex = err;
  } else {
    // 2) Tenta mapear (Zod/Prisma/JWT/…)
    const mapped = mapToException(err);
    if (mapped) {
      ex = mapped;
    } else {
      // 3) Desconhecido => INTERNAL_ERROR
      const def = CATALOG.errors.find(e => e.identifier === 'INTERNAL_ERROR');
      if (!def) throw new Error('INTERNAL_ERROR not found in catalog');
      ex = new Exception(
        { ...def, identifier: 'INTERNAL_ERROR' as const },
        {
          description: err && (err as Error).stack ? String((err as Error).stack) : undefined,
        }
      );
    }
  }

  // 4) Request ID e Path
  const requestId = (req as { requestId?: string }).requestId ?? uuidv4();
  const path = req.originalUrl || req.url;
  const name = getReasonPhrase(ex.status) || httpName(ex.status);

  // Log the error
  logger.error(
    {
      error: ex as unknown,
      requestId,
      path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    },
    'Request error'
  );

  const body: ErrorResponse = {
    success: false,
    code: ex.code,
    error: {
      id: ex.id,
      status: ex.status,
      name,
      details: {
        timestamp: new Date().toISOString(),
        path,
        message: ex.messagePublic,
        ...(ex.meta ?? {}),
      },
    },
  };

  // 5) Cabeçalhos úteis
  res.setHeader('x-request-id', requestId);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(ex.status).json(body);
}
