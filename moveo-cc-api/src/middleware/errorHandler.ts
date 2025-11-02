import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  logger.error(`Error [${code}]: ${message}`, err);

  res.status(status).json({
    error: {
      status,
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  });
};

