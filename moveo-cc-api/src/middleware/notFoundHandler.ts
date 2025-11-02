import { Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      status: 404,
      code: 'NOT_FOUND',
      message: 'Requested resource not found',
      timestamp: new Date().toISOString(),
    },
  });
};

