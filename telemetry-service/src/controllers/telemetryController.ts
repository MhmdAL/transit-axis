import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import polyline from '@mapbox/polyline';
import { liveTrackingService } from '../services/liveTrackingService';

const prisma = new PrismaClient();

export const telemetryController = {
  // Create/Update telemetry (upsert to Telemetry, insert to TelemetryLog)
  async createTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, tripId, routeId, driverId, latitude, longitude, 
        speed, heading, altitude, accuracy, odometer, timestamp } = req.body;

      if (!vehicleId || latitude == null || longitude == null) {
        return res.status(400).json({
          success: false,
          message: 'vehicleId, latitude, and longitude are required'
        });
      }

      const telemetryData = {
        vehicleId: parseInt(vehicleId),
        tripId: tripId != null ? parseInt(tripId) : null,
        routeId: routeId != null ? parseInt(routeId) : null,
        driverId: driverId != null ? driverId : null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: speed != null ? parseFloat(speed) : null,
        heading: heading != null ? parseFloat(heading) : null,
        altitude: altitude != null ? parseFloat(altitude) : null,
        accuracy: accuracy != null ? parseFloat(accuracy) : null,
        odometer: odometer != null ? parseFloat(odometer) : null,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      };

      // Use transaction to update both tables
      const [telemetry, telemetryLog] = await prisma.$transaction([
        // Upsert to Telemetry (keeps only latest)
        prisma.telemetry.upsert({
          where: { vehicleId: telemetryData.vehicleId },
          update: telemetryData,
          create: telemetryData
        }),
        // Insert to TelemetryLog (keeps history)
        prisma.telemetryLog.create({
          data: telemetryData
        })
      ]);

      // Forward telemetry to live tracking API (fire and forget)
      const liveTrackingTelemetry = liveTrackingService.convertToLiveTrackingFormat(vehicleId, telemetryData);

      console.log("liveTrackingTelemetry", liveTrackingTelemetry);
      liveTrackingService.forwardTelemetry(liveTrackingTelemetry).catch((error) => {
        console.error('Error forwarding telemetry to live tracking:', error);
      });

      return res.status(201).json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get all current telemetry (latest state of all vehicles)
  async listTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const telemetry = await prisma.telemetry.findMany({
        orderBy: { updatedAt: 'desc' }
      });

      return res.json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get telemetry for a specific vehicle
  async getTelemetryByVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;

      const telemetry = await prisma.telemetry.findUnique({
        where: { vehicleId: parseInt(vehicleId) }
      });

      if (!telemetry) {
        return res.status(404).json({
          success: false,
          message: 'Telemetry not found for this vehicle'
        });
      }

      return res.json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get telemetry logs for a specific vehicle
  async getTelemetryLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { startTime, endTime, limit, tripId } = req.query;

      const where: any = {
        vehicleId: parseInt(vehicleId)
      };

      if (tripId) {
        where.tripId = parseInt(tripId as string);
      }

      if (startTime || endTime) {
        where.timestamp = {};
        if (startTime) where.timestamp.gte = new Date(startTime as string);
        if (endTime) where.timestamp.lte = new Date(endTime as string);
      }

      const logs = await prisma.telemetryLog.findMany({
        where,
        orderBy: { timestamp: 'asc' },
        take: limit ? parseInt(limit as string) : undefined
      });

      return res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get telemetry logs as polyline-encoded path
  async getTelemetryPath(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { startTime, endTime, limit } = req.query;

      const parsedVehicleId = parseInt(vehicleId);
      if (isNaN(parsedVehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicleId'
        });
      }

      const where: any = {
        vehicleId: parsedVehicleId
      };

      if (startTime || endTime) {
        where.timestamp = {};
        if (startTime) where.timestamp.gte = new Date(startTime as string);
        if (endTime) where.timestamp.lte = new Date(endTime as string);
      }

      const logs = await prisma.telemetryLog.findMany({
        where,
        orderBy: { timestamp: 'asc' },
        take: limit ? parseInt(limit as string) : undefined
      });

      if (logs.length === 0) {
        return res.json({
          success: true,
          data: {
            polyline: '',
            points: []
          }
        });
      }

      const coordinates: [number, number][] = logs.map((log) => [log.latitude, log.longitude]);
      const encodedPolyline = polyline.encode(coordinates);

      return res.json({
        success: true,
        data: {
          polyline: encodedPolyline,
          points: logs.map((log) => ({
            latitude: log.latitude,
            longitude: log.longitude,
            speed: log.speed,
            heading: log.heading,
            timestamp: log.timestamp
          }))
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async getTripPath(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.params;

      const parsedTripId = parseInt(tripId);
      if (isNaN(parsedTripId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tripId'
        });
      }

      const logs = await prisma.telemetryLog.findMany({
        where: {
          tripId: parsedTripId
        },
        orderBy: { timestamp: 'asc' }
      });

      if (logs.length === 0) {
        return res.json({
          success: true,
          data: {
            polyline: '',
            points: []
          }
        });
      }

      const coordinates: [number, number][] = logs.map((log) => [log.latitude, log.longitude]);
      const encodedPolyline = polyline.encode(coordinates);

      return res.json({
        success: true,
        data: {
          polyline: encodedPolyline,
          points: logs.map((log) => ({
            latitude: log.latitude,
            longitude: log.longitude,
            speed: log.speed,
            heading: log.heading,
            timestamp: log.timestamp
          }))
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get telemetry for multiple vehicles
  async getMultipleVehiclesTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleIds } = req.body;

      if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'vehicleIds array is required and must not be empty'
        });
      }

      // Fetch latest telemetry for each vehicle and return as a list
      const telemetryList: any[] = [];

      for (const vehicleId of vehicleIds) {
        const telemetry = await prisma.telemetry.findUnique({
          where: { vehicleId: parseInt(vehicleId) }
        });

        if (telemetry) {
          telemetryList.push({
            vehicleId: vehicleId.toString(),
            tripId: telemetry.tripId,
            routeId: telemetry.routeId,
            driverId: telemetry.driverId,
            latitude: telemetry.latitude,
            longitude: telemetry.longitude,
            speed: telemetry.speed || 0,
            bearing: telemetry.heading || 0,
            timestamp: telemetry.updatedAt.toISOString()
          });
        }
      }

      return res.json({
        success: true,
        data: telemetryList
      });
    } catch (error) {
      return next(error);
    }
  }
};

