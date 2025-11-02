import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const vehicleModelController = {
  
  async getAllVehicleModels(req: Request, res: Response, next: NextFunction) {
    try {
      const models = await prisma.vehicleModel.findMany();

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      return next(error);
    }
  },

  async searchVehicleModels(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      
      if (!search || typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search parameter is required'
        });
      }

      const models = await prisma.vehicleModel.findMany({
        where: {
          OR: [
            { make: { contains: search, mode: 'insensitive' } },
            { manufacturer: { contains: search, mode: 'insensitive' } },
            { year: { equals: parseInt(search) || undefined } }
          ]
        },
        take: 10 // Limit results for performance
      });

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      return next(error);
    }
  },

  async getVehicleModelById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const model = await prisma.vehicleModel.findUnique({
        where: { id: BigInt(id) }
      });

      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle model not found'
        });
      }

      res.json({
        success: true,
        data: model
      });
    } catch (error) {
      return next(error);
    }
  },

  async createVehicleModel(req: Request, res: Response, next: NextFunction) {
    try {
      const { make, year, manufacturer, capacity } = req.body;
      
      const model = await prisma.vehicleModel.create({
        data: {
          make,
          year,
          manufacturer,
          capacity
        }
      });

      res.status(201).json({
        success: true,
        data: model
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateVehicleModel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { make, year, manufacturer, capacity } = req.body;

      const model = await prisma.vehicleModel.update({
        where: { id: BigInt(id) },
        data: {
          make,
          year,
          manufacturer,
          capacity
        }
      });

      res.json({
        success: true,
        data: model
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteVehicleModel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await prisma.vehicleModel.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Vehicle model deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
};
