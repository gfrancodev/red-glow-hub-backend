import type { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId: RequestHandler = (req, res, next) => {
  const rid = (req.headers['x-request-id'] as string) || uuidv4();
  (req as unknown as { requestId: string }).requestId = rid;
  res.setHeader('x-request-id', rid);
  next();
};
