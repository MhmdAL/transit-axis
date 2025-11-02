import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';

const prisma = new PrismaClient();

export const trackingController = {
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
  },

  async getMultipleVehiclesTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleIds } = req.body;

      if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'vehicleIds array is required and must not be empty'
        });
      }

      // Call telemetry-service to fetch telemetry data
      const telemetryServiceUrl = `${config.telemetryServiceUrl}/api/telemetry/vehicles`;
      
      const response = await fetch(telemetryServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vehicleIds })
      });

      if (!response.ok) {
        throw new Error(`Telemetry service error: ${response.statusText}`);
      }

      const telemetryData = (await response.json()) as { data: any[] };

      res.json({
        success: true,
        data: telemetryData.data
      });
    } catch (error) {
      return next(error);
    }
  }
};
