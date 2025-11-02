import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Returns server health status
 */
router.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'OK',
    service: 'moveo-cc-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;

