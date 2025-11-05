import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const incidentController = {
  async getIncidentsByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.params;

      const incidents = await prisma.incident.findMany({
        where: { tripId: BigInt(tripId) },
        include: {
          trip: true,
          route: true,
          vehicle: true,
          reportedByUser: true,
          resolvedByUser: true,
          driver: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { reportedAt: 'desc' }
      });

      res.json({
        success: true,
        data: incidents.map(incident => ({
          id: incident.id.toString(),
          tripId: incident.tripId.toString(),
          type: incident.type,
          routeId: incident.routeId.toString(),
          vehicleId: incident.vehicleId.toString(),
          driverId: incident.driverId.toString(),
          description: incident.description,
          severity: incident.severity,
          status: incident.status,
          reportedAt: incident.reportedAt,
          reportedByUserId: incident.reportedByUserId.toString(),
          reportedByUser: incident.reportedByUser?.name,
          resolvedAt: incident.resolvedAt,
          resolvedByUserId: incident.resolvedByUserId?.toString(),
          resolvedByUser: incident.resolvedByUser?.name,
          resolvedNotes: incident.resolvedNotes,
          vehicleFleetNo: incident.vehicle?.fleetNo,
          driverName: incident.driver?.user?.name,
          routeName: incident.route?.name
        }))
      });
    } catch (error) {
      return next(error);
    }
  },

  async createIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId, routeId, vehicleId, driverId, reportedByUserId, description, severity } = req.body;

      if (!tripId || !routeId || !vehicleId || !driverId || !reportedByUserId || !description) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const { type } = req.body;

      const incident = await prisma.incident.create({
        data: {
          tripId: BigInt(tripId),
          routeId: BigInt(routeId),
          vehicleId: BigInt(vehicleId),
          driverId: BigInt(driverId),
          reportedByUserId: BigInt(reportedByUserId),
          description,
          type: type || 'OTHER',
          severity: severity || 'LOW',
          reportedAt: new Date(),
          status: 'OPEN'
        },
        include: {
          vehicle: true,
          driver: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          route: true
        }
      });

      res.status(201).json({
        success: true,
        data: {
          id: incident.id.toString(),
          tripId: incident.tripId.toString(),
          routeId: incident.routeId.toString(),
          vehicleId: incident.vehicleId.toString(),
          driverId: incident.driverId.toString(),
          description: incident.description,
          type: incident.type,
          severity: incident.severity,
          status: incident.status,
          reportedAt: incident.reportedAt,
          reportedByUserId: incident.reportedByUserId.toString(),
          vehicleFleetNo: incident.vehicle?.fleetNo,
          driverName: incident.driver?.user?.name,
          routeName: incident.route?.name
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async resolveIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resolvedByUserId, resolvedNotes } = req.body;

      if (!resolvedByUserId || !resolvedNotes) {
        return res.status(400).json({
          success: false,
          message: 'Resolved by user ID and notes are required'
        });
      }

      const incident = await prisma.incident.update({
        where: { id: BigInt(id) },
        data: {
          status: 'RESOLVED',
          resolvedByUserId: BigInt(resolvedByUserId),
          resolvedAt: new Date(),
          resolvedNotes
        },
        include: {
          reportedByUser: true,
          resolvedByUser: true,
          vehicle: true,
          driver: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          route: true
        }
      });

      res.json({
        success: true,
        data: {
          id: incident.id.toString(),
          tripId: incident.tripId.toString(),
          routeId: incident.routeId.toString(),
          type: incident.type,
          vehicleId: incident.vehicleId.toString(),
          driverId: incident.driverId.toString(),
          description: incident.description,
          severity: incident.severity,
          status: incident.status,
          reportedAt: incident.reportedAt,
          reportedByUserId: incident.reportedByUserId.toString(),
          reportedByUser: incident.reportedByUser?.name,
          resolvedAt: incident.resolvedAt,
          resolvedByUserId: incident.resolvedByUserId?.toString(),
          resolvedByUser: incident.resolvedByUser?.name,
          resolvedNotes: incident.resolvedNotes,
          vehicleFleetNo: incident.vehicle.fleetNo,
          driverName: incident.driver.user.name,
          routeName: incident.route.name
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateIncidentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const incident = await prisma.incident.update({
        where: { id: BigInt(id) },
        data: { status },
        include: {
          vehicle: true,
          driver: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          route: true
        }
      });

      res.json({
        success: true,
        data: {
          id: incident.id.toString(),
          status: incident.status
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

