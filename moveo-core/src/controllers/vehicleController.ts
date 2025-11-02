import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const vehicleController = {
  async getAllVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, limit = 50, offset = 0 } = req.query;
      
      // Build filter conditions
      const where: any = {};
      
      if (search && typeof search === 'string' && search.trim()) {
        const searchTerm = search.trim();
        where.OR = [
          { fleetNo: { contains: searchTerm, mode: 'insensitive' } },
          { plateNo: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      const vehicles = await prisma.vehicle.findMany({
        where,
        include: {
          model: true
        },
        take: parseInt(limit as string) || 50,
        skip: parseInt(offset as string) || 0
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
          model: true
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

};
