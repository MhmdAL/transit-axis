import { Router, Request, Response } from 'express';
import { vehicleTracking } from '@/services/vehicleTracking';

const router = Router();

/**
 * GET /stats
 * Returns server statistics and metrics
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    const stats = vehicleTracking.getStats();

    res.status(200).json({
      timestamp: Date.now(),
      server: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      },
      tracking: {
        totalTelemetryReceived: stats.totalTelemetryReceived,
        subscriptions: {
          totalVehicles: stats.subscriptions.totalVehicles,
          totalClients: stats.subscriptions.totalClients,
          totalSubscriptions: stats.subscriptions.totalSubscriptions,
          vehicleSubscriptions: stats.subscriptions.vehicleSubscriptions,
        },
        batcher: {
          totalBatches: stats.batcher.totalBatches,
          totalPoints: stats.batcher.totalPoints,
          pendingBatches: stats.batcher.pendingBatches,
          bufferedVehicles: stats.batcher.bufferedVehicles,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      timestamp: Date.now(),
    });
  }
});

export default router;

