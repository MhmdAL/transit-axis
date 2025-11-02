import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const stopController = {
  async getAllStops(req: Request, res: Response, next: NextFunction) {
    try {
      const stops = await prisma.stop.findMany({
        include: {
          location: true
        }
      });

      res.json({
        success: true,
        data: stops
      });
    } catch (error) {
      return next(error);
    }
  },

  async getStopById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stop = await prisma.stop.findUnique({
        where: { id: BigInt(id) }
      });

      if (!stop) {
        return res.status(404).json({
          success: false,
          message: 'Stop not found'
        });
      }

      res.json({
        success: true,
        data: stop
      });
    } catch (error) {
      return next(error);
    }
  },

  async createStop(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, lat, lon } = req.body;

      const location = await prisma.location.create({
        data: {
          lat,
          lon
        }
      });

      const stop = await prisma.stop.create({
        data: {
          name,
          code,
          locationId: location.id
        }
      });

      res.status(201).json({
        success: true,
        data: stop
      });
    } catch (error) {
      return next(error);
    }
  },

  // async updateRoute(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { id } = req.params;
  //     const { name, code, isActive, totalEstimatedDuration } = req.body;

  //     const route = await prisma.route.update({
  //       where: { id: BigInt(id) },
  //       data: {
  //         name,
  //         code,
  //         isActive,
  //         totalEstimatedDuration
  //       }
  //     });

  //     res.json({
  //       success: true,
  //       data: route
  //     });
  //   } catch (error) {
  //     return next(error);
  //   }
  // },

  // async deleteRoute(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { id } = req.params;
      
  //     await prisma.route.delete({
  //       where: { id: BigInt(id) }
  //     });

  //     res.json({
  //       success: true,
  //       message: 'Route deleted successfully'
  //     });
  //   } catch (error) {
  //     return next(error);
  //   }
  // },

};
