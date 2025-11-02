import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const trackingController = {
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, lat, lon, speed, ignition } = req.body;

      // Create new telemetry record
      const telemetry = await prisma.vehicleTelemetry.create({
        data: {
          vehicleId: BigInt(vehicleId),
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          speed: speed ? parseFloat(speed) : null,
          ignition: Boolean(ignition)
        }
      });

      // Also add to history
      await prisma.vehicleTelemetryHistory.create({
        data: {
          vehicleId: BigInt(vehicleId),
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          speed: speed ? parseFloat(speed) : null,
          ignition: Boolean(ignition),
          trackedOn: new Date()
        }
      });

      res.json({
        success: true,
        data: telemetry,
        message: 'Location updated successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getCurrentLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;

      const latestTelemetry = await prisma.vehicleTelemetry.findFirst({
        where: { vehicleId: BigInt(vehicleId) },
        orderBy: { trackedOn: 'desc' }
      });

      if (!latestTelemetry) {
        return res.status(404).json({
          success: false,
          message: 'No location data found for this vehicle'
        });
      }

      res.json({
        success: true,
        data: {
          lat: latestTelemetry.lat,
          lon: latestTelemetry.lon,
          speed: latestTelemetry.speed,
          ignition: latestTelemetry.ignition,
          trackedOn: latestTelemetry.trackedOn
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async getLocationHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { 
        startDate, 
        endDate, 
        limit = 1000, 
        offset = 0 
      } = req.query;

      const whereClause: any = {
        vehicleId: BigInt(vehicleId)
      };

      if (startDate && endDate) {
        whereClause.trackedOn = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const history = await prisma.vehicleTelemetryHistory.findMany({
        where: whereClause,
        orderBy: { trackedOn: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      return next(error);
    }
  },

  async getLiveTracking(req: Request, res: Response, next: NextFunction) {
    try {
      // This would typically be handled by WebSocket
      // For now, return a placeholder response
      res.json({
        success: true,
        message: 'Live tracking endpoint - use WebSocket for real-time updates',
        data: {
          vehicles: [],
          message: 'Connect to WebSocket for live tracking data'
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};
