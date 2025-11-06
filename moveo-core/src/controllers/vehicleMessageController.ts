import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const vehicleMessageController = {
  async getAllVehicleMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, severity, limit = 50, offset = 0 } = req.query;

      const where: any = {};
      if (vehicleId) {
        where.vehicleId = BigInt(vehicleId as string);
      }
      if (severity) {
        where.severity = severity;
      }

      const messages = await prisma.vehicleMessage.findMany({
        where,
        include: {
          vehicle: true,
          route: true,
          trip: true,
          sentByUser: {
            select: { name: true, email: true, userType: true }
          }
        },
        orderBy: { sentAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.vehicleMessage.count({ where });

      res.json({
        success: true,
        data: messages.map(msg => ({
          id: msg.id.toString(),
          vehicleId: msg.vehicleId.toString(),
          routeId: msg.routeId?.toString(),
          tripId: msg.tripId?.toString(),
          message: msg.message,
          sentAt: msg.sentAt,
          severity: msg.severity,
          sentByUserId: msg.sentByUserId.toString(),
          sentByUser: msg.sentByUser?.name,
          sentByUserType: msg.sentByUser?.userType,
          vehicleFleetNo: msg.vehicle?.fleetNo,
          routeName: msg.route?.name
        })),
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async getVehicleMessageById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const message = await prisma.vehicleMessage.findUnique({
        where: { id: BigInt(id) },
        include: {
          vehicle: true,
          route: true,
          trip: true,
          sentByUser: {
            select: { name: true, email: true, userType: true }
          }
        }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle message not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: message.id.toString(),
          vehicleId: message.vehicleId.toString(),
          routeId: message.routeId?.toString(),
          tripId: message.tripId?.toString(),
          message: message.message,
          sentAt: message.sentAt,
          severity: message.severity,
          sentByUserId: message.sentByUserId.toString(),
          sentByUser: message.sentByUser?.name,
          sentByUserType: message.sentByUser?.userType,
          vehicleFleetNo: message.vehicle?.fleetNo,
          routeName: message.route?.name
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMessagesByVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await prisma.vehicleMessage.findMany({
        where: { vehicleId: BigInt(vehicleId) },
        include: {
          sentByUser: {
            select: { name: true, email: true, userType: true }
          },
          vehicle: true,
          route: true,
          trip: true
        },
        orderBy: { sentAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.vehicleMessage.count({
        where: { vehicleId: BigInt(vehicleId) }
      });

      res.json({
        success: true,
        data: messages.map(msg => ({
          id: msg.id.toString(),
          vehicleId: msg.vehicleId.toString(),
          routeId: msg.routeId?.toString(),
          tripId: msg.tripId?.toString(),
          message: msg.message,
          sentAt: msg.sentAt,
          severity: msg.severity,
          sentByUserId: msg.sentByUserId.toString(),
          sentByUser: msg.sentByUser?.name,
          sentByUserType: msg.sentByUser?.userType,
          routeName: msg.route?.name
        })),
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async createVehicleMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, message, sentByUserId, severity, routeId, tripId } = req.body;

      if (!vehicleId || !message || !sentByUserId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: vehicleId, message, sentByUserId'
        });
      }

      // Validate severity if provided
      if (severity && !['NORMAL', 'WARNING', 'CRITICAL'].includes(severity)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid severity. Must be NORMAL, WARNING, or CRITICAL'
        });
      }

      const vehicleMessage = await prisma.vehicleMessage.create({
        data: {
          vehicleId: BigInt(vehicleId),
          message,
          sentByUserId: BigInt(sentByUserId),
          severity: severity || 'NORMAL',
          sentAt: new Date(),
          ...(routeId && { routeId: BigInt(routeId) }),
          ...(tripId && { tripId: BigInt(tripId) })
        },
        include: {
          vehicle: true,
          route: true,
          trip: true,
          sentByUser: {
            select: { name: true, email: true, userType: true }
          }
        }
      });

      const response = {
        success: true,
        data: {
          id: vehicleMessage.id.toString(),
          vehicleId: vehicleMessage.vehicleId.toString(),
          routeId: vehicleMessage.routeId?.toString(),
          tripId: vehicleMessage.tripId?.toString(),
          message: vehicleMessage.message,
          sentAt: vehicleMessage.sentAt,
          severity: vehicleMessage.severity,
          sentByUserId: vehicleMessage.sentByUserId.toString(),
          sentByUser: vehicleMessage.sentByUser?.name,
          sentByUserType: vehicleMessage.sentByUser?.userType,
          vehicleFleetNo: vehicleMessage.vehicle?.fleetNo,
          routeName: vehicleMessage.route?.name
        }
      };

      console.log('Vehicle message created:', response);

      // Notify route subscribers if routeId exists
      if (vehicleMessage.routeId) {
        console.log('Notifying route subscribers for route:', vehicleMessage.routeId);
        try {
          const moveooCCApiUrl = 'http://moveo-cc-api:3004';
          await fetch(`${moveooCCApiUrl}/api/message-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: vehicleMessage.id.toString(),
              vehicleId: vehicleMessage.vehicleId.toString(),
              routeId: vehicleMessage.routeId.toString(),
              tripId: vehicleMessage.tripId?.toString(),
              message: vehicleMessage.message,
              severity: vehicleMessage.severity,
              sentByUser: vehicleMessage.sentByUser?.name,
              sentByUserType: vehicleMessage.sentByUser?.userType,
              sentAt: vehicleMessage.sentAt,
              vehicleFleetNo: vehicleMessage.vehicle?.fleetNo,
            })
          });
        } catch (notifyError) {
          console.error('Failed to notify message subscribers:', notifyError);
          // Don't fail the request if notification fails
        }
      }

      res.status(201).json(response);
    } catch (error) {
      return next(error);
    }
  },

  async updateVehicleMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { message, severity } = req.body;

      if (!message && !severity) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (message or severity) must be provided'
        });
      }

      if (severity && !['NORMAL', 'WARNING', 'CRITICAL'].includes(severity)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid severity. Must be NORMAL, WARNING, or CRITICAL'
        });
      }

      const vehicleMessage = await prisma.vehicleMessage.update({
        where: { id: BigInt(id) },
        data: {
          ...(message && { message }),
          ...(severity && { severity })
        },
        include: {
          vehicle: true,
          sentByUser: {
            select: { name: true, email: true, userType: true }
          }
        }
      });

      res.json({
        success: true,
        data: {
          id: vehicleMessage.id.toString(),
          vehicleId: vehicleMessage.vehicleId.toString(),
          message: vehicleMessage.message,
          sentAt: vehicleMessage.sentAt,
          severity: vehicleMessage.severity,
          sentByUserId: vehicleMessage.sentByUserId.toString(),
          sentByUser: vehicleMessage.sentByUser?.name,
          sentByUserType: vehicleMessage.sentByUser?.userType,
          vehicleFleetNo: vehicleMessage.vehicle?.fleetNo
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteVehicleMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.vehicleMessage.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Vehicle message deleted successfully',
        data: { id }
      });
    } catch (error) {
      return next(error);
    }
  }
};

