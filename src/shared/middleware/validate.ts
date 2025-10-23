import type { RequestHandler } from 'express';
import { z } from 'zod';

export const validate =
  (schemas: { body?: z.ZodTypeAny; query?: z.ZodTypeAny; params?: z.ZodTypeAny }): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        // Não modificar req.query diretamente, apenas validar
        (req as any).validatedQuery = parsedQuery;
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        // Não modificar req.params diretamente, apenas validar
        (req as any).validatedParams = parsedParams;
      }
      next();
    } catch (zerr) {
      // joga pro interceptor (mapeador Zod -> 422)
      next(zerr);
    }
  };
