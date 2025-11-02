import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const vehicleController = {
  async getAllVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          model: true,
          telemetry: {
            orderBy: { trackedOn: 'desc' },
            take: 1
          }
        }
      });

      res.json({
        success: true,
        data: vehicles
      });
    } catch (error) {
      return next(error);
    }
  },

  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: BigInt(id) },
        include: {
          model: true,
          telemetry: {
            orderBy: { trackedOn: 'desc' },
            take: 1
          }
        }
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      return next(error);
    }
  },

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { plateNo, fleetNo, vehicleModelId } = req.body;
      
      const vehicle = await prisma.vehicle.create({
        data: {
          plateNo,
          fleetNo,
          modelId: BigInt(vehicleModelId)
        }
      });

      res.status(201).json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { plateNo, fleetNo, modelId } = req.body;

      const vehicle = await prisma.vehicle.update({
        where: { id: BigInt(id) },
        data: {
          plateNo,
          fleetNo,
          modelId: modelId ? BigInt(modelId) : undefined
        },
        include: { model: true }
      });

      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await prisma.vehicle.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getVehicleLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const latestTelemetry = await prisma.vehicleTelemetry.findFirst({
        where: { vehicleId: BigInt(id) },
        orderBy: { trackedOn: 'desc' }
      });

      if (!latestTelemetry) {
        return res.status(404).json({
          success: false,
          message: 'No location data found'
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

  async getVehicleTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const telemetry = await prisma.vehicleTelemetry.findMany({
        where: { vehicleId: BigInt(id) },
        orderBy: { trackedOn: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      res.json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      return next(error);
    }
  },

};
