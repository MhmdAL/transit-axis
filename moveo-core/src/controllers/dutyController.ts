import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dutyController = {
  async getAllDuties(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 100, date, startDate, endDate, scheduleId, driverId, vehicleId, dutyType, routeId, driverIds, vehicleIds, routeIds } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      // Handle single date filter
      if (date) {
        const targetDate = new Date(date as string);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        where.date = {
          gte: startOfDay,
          lte: endOfDay
        };
      }

      console.log(driverId);
      console.log(startDate);
      console.log(endDate);
      
      // Handle date range filter (startDate and endDate)
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        // Set start to beginning of day
        start.setHours(0, 0, 0, 0);
        // Set end to end of day
        end.setHours(23, 59, 59, 999);
        where.date = {
          gte: start,
          lte: end
        };
      } else if (startDate) {
        // Only startDate provided
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date = {
          gte: start
        };
      } else if (endDate) {
        // Only endDate provided
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date = {
          lte: end
        };
      }
      
      if (scheduleId) {
        where.scheduleId = BigInt(scheduleId as string);
      }
      
      // Driver filtering - support both single driverId and array of driverIds
      if (driverIds) {
        const driverIdArray = Array.isArray(driverIds) ? driverIds : [driverIds];
        where.driverId = {
          in: driverIdArray.map(id => BigInt(id as string))
        };
      } else if (driverId) {
        where.driverId = BigInt(driverId as string);
      }
      
      // Vehicle filtering - support both single vehicleId and array of vehicleIds
      if (vehicleIds) {
        const vehicleIdArray = Array.isArray(vehicleIds) ? vehicleIds : [vehicleIds];
        where.vehicleId = {
          in: vehicleIdArray.map(id => BigInt(id as string))
        };
      } else if (vehicleId) {
        where.vehicleId = BigInt(vehicleId as string);
      }
      
      if (dutyType) {
        where.dutyType = dutyType;
      }

      // Route filtering - support both single routeId and array of routeIds
      if (routeIds) {
        const routeIdArray = Array.isArray(routeIds) ? routeIds : [routeIds];
        where.dutyType = 'TRIP'; // Ensure we only get trip duties when filtering by route
        where.tripDuties = {
          some: {
            routeId: {
              in: routeIdArray.map(id => BigInt(id as string))
            }
          }
        };
      } else if (routeId) {
        where.dutyType = 'TRIP'; // Ensure we only get trip duties when filtering by route
        where.tripDuties = {
          some: {
            routeId: BigInt(routeId as string)
          }
        };
      }

      const [duties, total] = await Promise.all([
        prisma.duty.findMany({
          where,
          include: {
            driver: {
              include: {
                user: true
              }
            },
            vehicle: {
              include: {
                model: true
              }
            },
            block: {
              include: {
                vehicleBlockTemplate: true
              }
            },
            run: {
              include: {
                driverRunTemplate: true
              }
            },
            tripDuties: {
              include: {
                route: true
              }
            },
            washingDuties: true,
            maintenanceDuties: true
          },
          orderBy: { date: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.duty.count({ where })
      ]);

      res.json({
        success: true,
        data: duties,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async getDutyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const duty = await prisma.duty.findUnique({
        where: { id: BigInt(id) },
        include: {
          driver: {
            include: {
              user: true
            }
          },
          vehicle: {
            include: {
              model: true
            }
          },
          block: {
            include: {
              vehicleBlockTemplate: true
            }
          },
          run: {
            include: {
              driverRunTemplate: true
            }
          }
        }
      });

      if (!duty) {
        return res.status(404).json({
          success: false,
          message: 'Duty not found'
        });
      }

      res.json({
        success: true,
        data: duty
      });
    } catch (error) {
      return next(error);
    }
  },

  async createDuty(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, startTime, endTime, scheduleId, driverId, vehicleId, dutyType } = req.body;
      
      // Validate required fields
      if (!date || !startTime || !endTime || !scheduleId || !driverId || !vehicleId || !dutyType) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: date, startTime, endTime, scheduleId, driverId, vehicleId, dutyType'
        });
      }

      // Validate date range
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      
      if (start >= end) {
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

      // Check if driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: BigInt(driverId) }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Check if vehicle exists
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: BigInt(vehicleId) }
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      const duty = await prisma.duty.create({
        data: {
          date: new Date(`${date}T00:00:00`),
          startTime: new Date(`${date}T${startTime}`),
          endTime: new Date(`${date}T${endTime}`),
          driverId: BigInt(driverId),
          vehicleId: BigInt(vehicleId),
          dutyType: dutyType
        },
        include: {
          driver: {
            include: {
              user: true
            }
          },
          vehicle: {
            include: {
              model: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: duty
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateDuty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, startTime, endTime, scheduleId, driverId, vehicleId, dutyType } = req.body;

      // Check if duty exists
      const existingDuty = await prisma.duty.findUnique({
        where: { id: BigInt(id) }
      });

      if (!existingDuty) {
        return res.status(404).json({
          success: false,
          message: 'Duty not found'
        });
      }

      // Validate date range if both times are provided
      if (startTime && endTime && date) {
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        
        if (start >= end) {
          return res.status(400).json({
            success: false,
            message: 'End time must be after start time'
          });
        }
      }

      const updateData: any = {};
      
      if (date) updateData.date = new Date(`${date}T00:00:00`);
      if (startTime && date) updateData.startTime = new Date(`${date}T${startTime}`);
      if (endTime && date) updateData.endTime = new Date(`${date}T${endTime}`);
      if (scheduleId) updateData.scheduleId = BigInt(scheduleId);
      if (driverId) updateData.driverId = BigInt(driverId);
      if (vehicleId) updateData.vehicleId = BigInt(vehicleId);
      if (dutyType) updateData.dutyType = dutyType;

      const duty = await prisma.duty.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: {
          driver: {
            include: {
              user: true
            }
          },
          vehicle: {
            include: {
              model: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: duty
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteDuty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if duty exists
      const existingDuty = await prisma.duty.findUnique({
        where: { id: BigInt(id) }
      });

      if (!existingDuty) {
        return res.status(404).json({
          success: false,
          message: 'Duty not found'
        });
      }

      await prisma.duty.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Duty deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getDutiesByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const duties = await prisma.duty.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          driver: {
            include: {
              user: true
            }
          },
          vehicle: {
            include: {
              model: true
            }
          }
        },
        orderBy: { startTime: 'asc' }
      });

      res.json({
        success: true,
        data: duties
      });
    } catch (error) {
      return next(error);
    }
  },

  async getDutiesByDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { date } = req.query;

      const where: any = {
        driverId: BigInt(driverId)
      };

      if (date) {
        const targetDate = new Date(date as string);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        where.date = {
          gte: startOfDay,
          lte: endOfDay
        };
      }

      const duties = await prisma.duty.findMany({
        where,
        include: {
          driver: {
            include: {
              user: true
            }
          },
          vehicle: {
            include: {
              model: true
            }
          }
        },
        orderBy: { startTime: 'asc' }
      });

      res.json({
        success: true,
        data: duties
      });
    } catch (error) {
      return next(error);
    }
  },

  async getDutiesByVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { date } = req.query;

      const where: any = {
        vehicleId: BigInt(vehicleId)
      };

      if (date) {
        const targetDate = new Date(date as string);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        where.date = {
          gte: startOfDay,
          lte: endOfDay
        };
      }

      const duties = await prisma.duty.findMany({
        where,
        include: {
          driver: {
            include: {
              user: true
            }
          },
          vehicle: {
            include: {
              model: true
            }
          }
        },
        orderBy: { startTime: 'asc' }
      });

      res.json({
        success: true,
        data: duties
      });
    } catch (error) {
      return next(error);
    }
  },

  async createBulkTripDuties(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId, routeId, date, trips } = req.body;
      
      // Validate required fields
      if (!scheduleId || !routeId || !date || !trips || !Array.isArray(trips)) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: scheduleId, routeId, date, trips (array)'
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

      // Check if route exists
      const route = await prisma.route.findUnique({
        where: { id: BigInt(routeId) }
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      // Create duties and trip duties in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const createdDuties = [];
        const createdTripDuties = [];
        
        // Maps to track created blocks and runs (code -> block/run ID)
        const vehicleBlockMap = new Map<string, bigint>();
        const driverRunMap = new Map<string, bigint>();

        // Step 1: Create unique vehicle blocks and driver runs for this date
        const uniqueBlockCodes = new Set<string>();
        const uniqueRunCodes = new Set<string>();
        
        for (const trip of trips) {
          if (trip.vehicleBlockCode) uniqueBlockCodes.add(trip.vehicleBlockCode);
          if (trip.driverRunCode) uniqueRunCodes.add(trip.driverRunCode);
        }

        // Create vehicle blocks
        for (const code of uniqueBlockCodes) {
          // Find the template for this code
          const template = await tx.vehicleBlockTemplate.findFirst({
            where: {
              scheduleId: BigInt(scheduleId),
              code: code
            }
          });

          if (template) {
            // Create unique code with date
            const uniqueCode = `${code}-${date}`;
            
            // Try to find existing block or create new one
            let block = await tx.vehicleBlock.findUnique({
              where: { code: uniqueCode }
            });

            if (!block) {
              block = await tx.vehicleBlock.create({
                data: {
                  vehicleBlockTemplateId: template.id,
                  code: uniqueCode
                }
              });
            }
            
            vehicleBlockMap.set(code, block.id);
          }
        }

        // Create driver runs
        for (const code of uniqueRunCodes) {
          // Find the template for this code
          const template = await tx.driverRunTemplate.findFirst({
            where: {
              scheduleId: BigInt(scheduleId),
              code: code
            }
          });

          if (template) {
            // Create unique code with date
            const uniqueCode = `${code}-${date}`;
            
            // Try to find existing run or create new one
            let run = await tx.driverRun.findUnique({
              where: { code: uniqueCode }
            });

            if (!run) {
              run = await tx.driverRun.create({
                data: {
                  driverRunTemplateId: template.id,
                  code: uniqueCode
                }
              });
            }
            
            driverRunMap.set(code, run.id);
          }
        }

        // Step 2: Create duties linked to blocks and runs
        for (const trip of trips) {
          const blockId = trip.vehicleBlockCode ? vehicleBlockMap.get(trip.vehicleBlockCode) : null;
          const runId = trip.driverRunCode ? driverRunMap.get(trip.driverRunCode) : null;

          // Create duty
          const duty = await tx.duty.create({
            data: {
              date: new Date(`${date}T00:00:00`),
              startTime: new Date(`${date}T${trip.scheduledStartTime}`),
              endTime: new Date(`${date}T${trip.scheduledEndTime}`),
              driverId: null, // Initially unassigned
              vehicleId: null, // Initially unassigned
              dutyType: 'TRIP',
              blockId: blockId || null,
              runId: runId || null
            }
          });

          // Create trip duty
          const tripDuty = await tx.tripDuty.create({
            data: {
              dutyId: duty.id,
              routeId: BigInt(routeId)
            }
          });

          createdDuties.push(duty);
          createdTripDuties.push(tripDuty);
        }

        return { duties: createdDuties, tripDuties: createdTripDuties };
      });

      res.status(201).json({
        success: true,
        message: `Successfully created ${result.duties.length} trip duties`,
        data: {
          duties: result.duties,
          tripDuties: result.tripDuties
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async bulkUpdateDutyAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignments } = req.body;

      if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({
          success: false,
          message: 'Assignments array is required'
        });
      }

      // Validate assignments
      for (const assignment of assignments) {
        if (!assignment.dutyId || (!assignment.driverId && !assignment.vehicleId)) {
          return res.status(400).json({
            success: false,
            message: 'Each assignment must have dutyId and at least one of driverId or vehicleId'
          });
        }
      }

      // Update duties in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedDuties = [];

        for (const assignment of assignments) {
          const updateData: any = {};
          
          if (assignment.driverId) {
            updateData.driverId = BigInt(assignment.driverId);
          }
          
          if (assignment.vehicleId) {
            updateData.vehicleId = BigInt(assignment.vehicleId);
          }

          const updatedDuty = await tx.duty.update({
            where: { id: BigInt(assignment.dutyId) },
            data: updateData,
            include: {
              driver: {
                include: {
                  user: true
                }
              },
              vehicle: {
                include: {
                  model: true
                }
              },
              tripDuties: {
                include: {
                  route: true
                }
              }
            }
          });

          updatedDuties.push(updatedDuty);
        }

        return updatedDuties;
      });

      res.json({
        success: true,
        message: `Successfully updated ${result.length} duty assignments`,
        data: result
      });
    } catch (error) {
      return next(error);
    }
  }
};
