import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const routeController = {
  async getAllRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, limit = 50, offset = 0 } = req.query;
      
      // Build filter conditions
      const where: any = {};
      
      if (search && typeof search === 'string' && search.trim()) {
        const searchTerm = search.trim();
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { code: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      const routes = await prisma.route.findMany({
        where,
        include: {
          routeStops: {
            include: { stop: { include: { location: true } } },
            orderBy: { stopOrder: 'asc' }
          }
        },
        take: parseInt(limit as string) || 50,
        skip: parseInt(offset as string) || 0
      });

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      return next(error);
    }
  },

  async getRouteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const route = await prisma.route.findUnique({
        where: { id: BigInt(id) },
        include: {
          routeStops: {
            include: { stop: { include: { location: true } } },
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      return next(error);
    }
  },

  async createRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, stops, segmentPaths } = req.body;
      
      // Separate new stops (id === 0) from existing stops
      const newStops = stops.filter((stop: any) => !stop.id || stop.id === 0 || stop.id === '0');
      const existingStops = stops.filter((stop: any) => stop.id && stop.id !== 0 && stop.id !== '0');
      
      // Create new stops first
      const createdStops = await Promise.all(
        newStops.map(async (stop: any) => {
          const createdStop = await prisma.stop.create({
            data: {
              name: stop.name,
              code: stop.code,
              location: {
                create: {
                  lat: stop.location.lat,
                  lon: stop.location.lon
                }
              }
            },
            include: { location: true }
          });
          return { ...stop, id: createdStop.id, _createdId: createdStop.id };
        })
      );
      
      // Combine all stops with their final IDs
      const allStopsWithIds = [
        ...existingStops,
        ...createdStops
      ];
      
      // Create the route first
      const route = await prisma.route.create({
        data: {
          name,
          code,
          isActive: true,
          totalEstimatedDuration: 0
        }
      });
      
      // Create routeStops with segment paths from frontend
      const routeStopsData = allStopsWithIds.map((stop: any, index: number) => ({
        routeId: route.id,
        stopId: BigInt(stop._createdId || stop.id),
        stopOrder: index,
        isActive: true,
        path: segmentPaths?.[index] || null  // Use path from frontend, or null if not provided
      }));
      
      await prisma.routeStop.createMany({
        data: routeStopsData
      });

      // Fetch the complete route with all data
      const completeRoute = await prisma.route.findUnique({
        where: { id: route.id },
        include: {
          routeStops: {
            include: {
              stop: { include: { location: true } }
            },
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: completeRoute
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, code, isActive, totalEstimatedDuration, stops, segmentPaths } = req.body;

      // If stops are provided, handle updating them
      if (stops && Array.isArray(stops)) {
        // Separate new stops (id === 0) from existing stops
        const newStops = stops.filter((stop: any) => !stop.id || stop.id === 0 || stop.id === '0');
        const existingStops = stops.filter((stop: any) => stop.id && stop.id !== 0 && stop.id !== '0');
        
        // Create new stops first
        const createdStops = await Promise.all(
          newStops.map(async (stop: any) => {
            const createdStop = await prisma.stop.create({
              data: {
                name: stop.name,
                code: stop.code,
                location: {
                  create: {
                    lat: stop.location.lat,
                    lon: stop.location.lon
                  }
                }
              },
              include: { location: true }
            });
            return { ...stop, id: createdStop.id, _createdId: createdStop.id };
          })
        );
        
        // Combine all stops with their final IDs
        const allStopsWithIds = [
          ...existingStops,
          ...createdStops
        ];
        
        // Delete existing routeStops for this route
        await prisma.routeStop.deleteMany({
          where: { routeId: BigInt(id) }
        });
        
        // Create new routeStops with segment paths from frontend
        const routeStopsData = allStopsWithIds.map((stop: any, index: number) => ({
          routeId: BigInt(id),
          stopId: BigInt(stop._createdId || stop.id),
          stopOrder: index,
          isActive: true,
          path: segmentPaths?.[index] || null  // Use path from frontend, or null if not provided
        }));
        
        await prisma.routeStop.createMany({
          data: routeStopsData
        });
      }

      const route = await prisma.route.update({
        where: { id: BigInt(id) },
        data: {
          name,
          code,
          isActive,
          totalEstimatedDuration
        },
        include: {
          routeStops: {
            include: {
              stop: { include: { location: true } }
            },
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await prisma.route.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Route deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getRouteStops(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const routeStops = await prisma.routeStop.findMany({
        where: { routeId: BigInt(id) },
        include: {
          stop: { include: { location: true } }
        },
        orderBy: { stopOrder: 'asc' }
      });

      res.json({
        success: true,
        data: routeStops
      });
    } catch (error) {
      return next(error);
    }
  },

  async addStopToRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: routeId } = req.params;
      const { stopId, stopOrder, eta, waitTime } = req.body;

      const routeStop = await prisma.routeStop.create({
        data: {
          routeId: BigInt(routeId),
          stopId: BigInt(stopId),
          stopOrder,
          eta,
          waitTime
        },
        include: {
          stop: { include: { location: true } }
        }
      });

      res.status(201).json({
        success: true,
        data: routeStop
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateRouteStop(req: Request, res: Response, next: NextFunction) {
    try {
      const { routeId, stopId } = req.params;
      const { stopOrder, isActive, eta, waitTime } = req.body;

      const routeStop = await prisma.routeStop.update({
        where: {
          id: BigInt(stopId) // Assuming this is the routeStop ID
        },
        data: {
          stopOrder,
          isActive,
          eta,
          waitTime
        },
        include: {
          stop: { include: { location: true } }
        }
      });

      res.json({
        success: true,
        data: routeStop
      });
    } catch (error) {
      return next(error);
    }
  },

  async removeStopFromRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { stopId } = req.params;
      
      await prisma.routeStop.delete({
        where: { id: BigInt(stopId) }
      });

      res.json({
        success: true,
        message: 'Stop removed from route successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
};
