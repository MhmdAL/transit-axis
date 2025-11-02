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
  },

  async getTripPath(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.params;

      if (!tripId) {
        return res.status(400).json({
          success: false,
          message: 'tripId is required'
        });
      }

      const telemetryServiceUrl = `${config.telemetryServiceUrl}/api/telemetry/trips/${tripId}/path`;
      
      const response = await fetch(telemetryServiceUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Telemetry service error: ${response.statusText}`);
      }

      const pathData = await response.json();

      res.json({
        success: true,
        data: pathData
      });
    } catch (error) {
      return next(error);
    }
  },

  async getTimeRangePath(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { startTime, endTime } = req.query;

      if (!vehicleId || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'vehicleId (route param), startTime, and endTime (query params) are required'
        });
      }

      const telemetryServiceUrl = `${config.telemetryServiceUrl}/api/telemetry/${vehicleId}/path`;
      
      const response = await fetch(`${telemetryServiceUrl}?startTime=${startTime}&endTime=${endTime}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Telemetry service error: ${response.statusText}`);
      }

      const pathData = await response.json();

      res.json({
        success: true,
        data: pathData
      });
    } catch (error) {
      return next(error);
    }
  }
};
