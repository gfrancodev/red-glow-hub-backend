import type { RequestHandler, Response } from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    total_items?: number;
    total_pages?: number;
    current_page?: number;
    limit?: number;
    in_page?: number;
    has_next_page?: boolean;
    has_previous_page?: boolean;
    next_cursor?: string;
  };
}

export const sendSuccess = <T>(res: Response, data: T, meta?: ApiResponse<T>['meta']) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  res.json(response);
};

export const sendError = (res: Response, status: number, message: string, code?: string) => {
  res.status(status).json({
    success: false,
    code: code ?? `PL-${status}`,
    error: {
      id: crypto.randomUUID(),
      status,
      name: message,
      details: {
        timestamp: new Date().toISOString(),
        path: res.req.originalUrl || res.req.url || 'unknown',
        message,
      },
    },
  });
};
