import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serviceScheduleController = {
  async getAllServiceSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceSchedules = await prisma.serviceSchedule.findMany({
        include: {
          vehicleBlockTemplates: true,
          driverRunTemplates: true,
          dutyTemplates: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform to include counts
      const schedulesWithCounts = serviceSchedules.map(schedule => ({
        ...schedule,
        vehicleBlockCount: schedule.vehicleBlockTemplates?.length || 0,
        driverRunCount: schedule.driverRunTemplates?.length || 0,
        dutyTemplateCount: schedule.dutyTemplates?.length || 0,
        // Remove the nested arrays from response to keep it clean
        VehicleBlockTemplate: undefined,
        DriverRunTemplate: undefined,
        dutyTemplates: undefined
      }));

      res.json({
        success: true,
        data: schedulesWithCounts
      });
    } catch (error) {
      return next(error);
    }
  },

  async getServiceScheduleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const serviceSchedule = await prisma.serviceSchedule.findUnique({
        where: { id: BigInt(id) },
        include: {
          dutyTemplates: {
            orderBy: { startTime: 'asc' }
          },
          vehicleBlockTemplates: true,
          driverRunTemplates: true
        }
      });

      if (!serviceSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Service schedule not found'
        });
      }

      res.json({
        success: true,
        data: serviceSchedule
      });
    } catch (error) {
      return next(error);
    }
  },

  async createServiceSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, vehicleBlockCodes, driverRunCodes, dutyTemplates } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name, start date, and end date are required'
        });
      }


      // Validate duty templates if provided
      if (dutyTemplates && Array.isArray(dutyTemplates)) {
        for (const template of dutyTemplates) {
          if (!template.startTime || !template.endTime || !template.dutyType) {
            return res.status(400).json({
              success: false,
              message: 'Duty templates must have startTime, endTime, and dutyType'
            });
          }

          // Validate time format (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(template.startTime) || !timeRegex.test(template.endTime)) {
            return res.status(400).json({
              success: false,
              message: 'Time format must be HH:MM'
            });
          }

          // Validate time range
          const startTime = new Date(`2000-01-01T${template.startTime}`);
          const endTime = new Date(`2000-01-01T${template.endTime}`);
          
          if (startTime >= endTime) {
            return res.status(400).json({
              success: false,
              message: `Template end time must be after start time for ${template.name || 'unnamed template'}`
            });
          }
        }
      }

      // Create service schedule with all templates in a transaction
      const serviceSchedule = await prisma.$transaction(async (tx) => {
        // Create the service schedule first
        const schedule = await tx.serviceSchedule.create({
          data: {
            name
          }
        });

        // Create vehicle block templates
        const vehicleBlockMap = new Map<string, bigint>();
        if (vehicleBlockCodes && Array.isArray(vehicleBlockCodes)) {
          for (const block of vehicleBlockCodes) {
            const created = await tx.vehicleBlockTemplate.create({
              data: {
                scheduleId: schedule.id,
                code: block.code,
                color: block.color
              }
            });
            vehicleBlockMap.set(block.code, created.id);
          }
        }

        // Create driver run templates
        const driverRunMap = new Map<string, bigint>();
        if (driverRunCodes && Array.isArray(driverRunCodes)) {
          for (const run of driverRunCodes) {
            const created = await tx.driverRunTemplate.create({
              data: {
                scheduleId: schedule.id,
                code: run.code,
                color: run.color
              }
            });
            driverRunMap.set(run.code, created.id);
          }
        }

        // Create duty templates with their block/run associations
        if (dutyTemplates && Array.isArray(dutyTemplates)) {
          for (const template of dutyTemplates) {
            await tx.dutyTemplate.create({
              data: {
                scheduleId: schedule.id,
                name: template.name,
                startTime: new Date(`2000-01-01T${template.startTime}`),
                endTime: new Date(`2000-01-01T${template.endTime}`),
                dutyType: template.dutyType,
                vehicleBlockTemplateId: template.vehicleBlockCode 
                  ? vehicleBlockMap.get(template.vehicleBlockCode) 
                  : null,
                driverRunTemplateId: template.driverRunCode 
                  ? driverRunMap.get(template.driverRunCode) 
                  : null
              }
            });
          }
        }

        // Fetch the complete schedule with all relationships
        return await tx.serviceSchedule.findUnique({
          where: { id: schedule.id },
          include: {
            vehicleBlockTemplates: true,
            driverRunTemplates: true,
            dutyTemplates: {
              include: {
                vehicleBlockTemplate: true,
                driverRunTemplate: true
              },
              orderBy: { startTime: 'asc' }
            }
          }
        });
      });

      res.status(201).json({
        success: true,
        data: serviceSchedule
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateServiceSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, vehicleBlockCodes, driverRunCodes, dutyTemplates } = req.body;

      // Check if service schedule exists
      const existingSchedule = await prisma.serviceSchedule.findUnique({
        where: { id: BigInt(id) }
      });

      if (!existingSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Service schedule not found'
        });
      }

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      // Validate duty templates if provided
      if (dutyTemplates && Array.isArray(dutyTemplates)) {
        for (const template of dutyTemplates) {
          if (!template.startTime || !template.endTime || !template.dutyType) {
            return res.status(400).json({
              success: false,
              message: 'Duty templates must have startTime, endTime, and dutyType'
            });
          }

          // Validate time format (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(template.startTime) || !timeRegex.test(template.endTime)) {
            return res.status(400).json({
              success: false,
              message: 'Time format must be HH:MM'
            });
          }
        }
      }

      // Perform full update in a transaction
      const serviceSchedule = await prisma.$transaction(async (tx) => {
        const scheduleId = BigInt(id);

        // Delete all existing templates (cascading delete will handle duty templates)
        await tx.vehicleBlockTemplate.deleteMany({
          where: { scheduleId }
        });

        await tx.driverRunTemplate.deleteMany({
          where: { scheduleId }
        });

        await tx.dutyTemplate.deleteMany({
          where: { scheduleId }
        });

        // Update the schedule name
        await tx.serviceSchedule.update({
          where: { id: scheduleId },
          data: { name }
        });

        // Create new vehicle block templates
        const vehicleBlockMap = new Map<string, bigint>();
        if (vehicleBlockCodes && Array.isArray(vehicleBlockCodes)) {
          for (const block of vehicleBlockCodes) {
            const created = await tx.vehicleBlockTemplate.create({
              data: {
                scheduleId,
                code: block.code,
                color: block.color
              }
            });
            vehicleBlockMap.set(block.code, created.id);
          }
        }

        // Create new driver run templates
        const driverRunMap = new Map<string, bigint>();
        if (driverRunCodes && Array.isArray(driverRunCodes)) {
          for (const run of driverRunCodes) {
            const created = await tx.driverRunTemplate.create({
              data: {
                scheduleId,
                code: run.code,
                color: run.color
              }
            });
            driverRunMap.set(run.code, created.id);
          }
        }

        // Create new duty templates
        if (dutyTemplates && Array.isArray(dutyTemplates)) {
          for (const template of dutyTemplates) {
            await tx.dutyTemplate.create({
              data: {
                scheduleId,
                name: template.name,
                startTime: new Date(`2000-01-01T${template.startTime}`),
                endTime: new Date(`2000-01-01T${template.endTime}`),
                dutyType: template.dutyType,
                vehicleBlockTemplateId: template.vehicleBlockCode 
                  ? vehicleBlockMap.get(template.vehicleBlockCode) 
                  : null,
                driverRunTemplateId: template.driverRunCode 
                  ? driverRunMap.get(template.driverRunCode) 
                  : null
              }
            });
          }
        }

        // Fetch the complete updated schedule
        return await tx.serviceSchedule.findUnique({
          where: { id: scheduleId },
          include: {
            vehicleBlockTemplates: true,
            driverRunTemplates: true,
            dutyTemplates: {
              include: {
                vehicleBlockTemplate: true,
                driverRunTemplate: true
              },
              orderBy: { startTime: 'asc' }
            }
          }
        });
      });

      res.json({
        success: true,
        data: serviceSchedule
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteServiceSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if service schedule exists
      const existingSchedule = await prisma.serviceSchedule.findUnique({
        where: { id: BigInt(id) }
      });

      if (!existingSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Service schedule not found'
        });
      }

      await prisma.serviceSchedule.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Service schedule deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  // Duty Template Management
  async getDutyTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const { dutyType } = req.query;

      const whereClause: any = {
        scheduleId: BigInt(scheduleId)
      };

      if (dutyType) {
        whereClause.dutyType = dutyType;
      }

      const dutyTemplates = await prisma.dutyTemplate.findMany({
        where: whereClause,
        include: {
          vehicleBlockTemplate: true,
          driverRunTemplate: true
        },
        orderBy: { startTime: 'asc' }
      });

      // Transform to include code strings and colors
      const transformedTemplates = dutyTemplates.map(template => ({
        ...template,
        vehicleBlockCode: template.vehicleBlockTemplate?.code,
        vehicleBlockColor: template.vehicleBlockTemplate?.color,
        driverRunCode: template.driverRunTemplate?.code,
        driverRunColor: template.driverRunTemplate?.color
      }));

      res.json({
        success: true,
        data: transformedTemplates
      });
    } catch (error) {
      return next(error);
    }
  },

  async createDutyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const { name, startTime, endTime, dutyType } = req.body;

      // Validate required fields
      if (!startTime || !endTime || !dutyType) {
        return res.status(400).json({
          success: false,
          message: 'startTime, endTime, and dutyType are required'
        });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Time format must be HH:MM'
        });
      }

      // Validate time range
      const startTimeDate = new Date(`2000-01-01T${startTime}`);
      const endTimeDate = new Date(`2000-01-01T${endTime}`);
      
      if (startTimeDate >= endTimeDate) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }

      // Check if schedule exists
      const schedule = await prisma.serviceSchedule.findUnique({
        where: { id: BigInt(scheduleId) }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Service schedule not found'
        });
      }

      const dutyTemplate = await prisma.dutyTemplate.create({
        data: {
          name,
          startTime: startTimeDate,
          endTime: endTimeDate,
          dutyType,
          scheduleId: BigInt(scheduleId)
        }
      });

      res.status(201).json({
        success: true,
        data: dutyTemplate
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateDutyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId, templateId } = req.params;
      const { name, startTime, endTime, dutyType } = req.body;

      // Check if template exists
      const existingTemplate = await prisma.dutyTemplate.findFirst({
        where: {
          id: BigInt(templateId),
          scheduleId: BigInt(scheduleId)
        }
      });

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Duty template not found'
        });
      }

      // Validate time format if provided
      if (startTime || endTime) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if ((startTime && !timeRegex.test(startTime)) || (endTime && !timeRegex.test(endTime))) {
          return res.status(400).json({
            success: false,
            message: 'Time format must be HH:MM'
          });
        }

        // Validate time range if both are provided
        if (startTime && endTime) {
          const startTimeDate = new Date(`2000-01-01T${startTime}`);
          const endTimeDate = new Date(`2000-01-01T${endTime}`);
          
          if (startTimeDate >= endTimeDate) {
            return res.status(400).json({
              success: false,
              message: 'End time must be after start time'
            });
          }
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (startTime !== undefined) updateData.startTime = new Date(`2000-01-01T${startTime}`);
      if (endTime !== undefined) updateData.endTime = new Date(`2000-01-01T${endTime}`);
      if (dutyType !== undefined) updateData.dutyType = dutyType;

      const dutyTemplate = await prisma.dutyTemplate.update({
        where: { id: BigInt(templateId) },
        data: updateData
      });

      res.json({
        success: true,
        data: dutyTemplate
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteDutyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId, templateId } = req.params;

      // Check if template exists
      const existingTemplate = await prisma.dutyTemplate.findFirst({
        where: {
          id: BigInt(templateId),
          scheduleId: BigInt(scheduleId)
        }
      });

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Duty template not found'
        });
      }

      await prisma.dutyTemplate.delete({
        where: { id: BigInt(templateId) }
      });

      res.json({
        success: true,
        message: 'Duty template deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
};
