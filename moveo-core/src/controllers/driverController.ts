import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

const prisma = new PrismaClient();

export const driverController = {
  async getAllDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const drivers = await prisma.driver.findMany({
        include: {
          user: true,
          shifts: {
            include: { vehicle: { include: { model: true } } },
            orderBy: { startTime: 'desc' }
          }
        }
      });

      return res.json({
        success: true,
        data: drivers.map(driver => ({
          id: driver.id,
          name: driver.user.name,
          qid: driver.user.qid,
          phone: driver.user.phone,
          email: driver.user.email,
          licenseExpiry: driver.licenseExpiry,
          shifts: driver.shifts
        }))
      });
    } catch (error) {
      return next(error);
    }
  },

  async getDriverById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const driver = await prisma.driver.findUnique({
        where: { id: BigInt(id) },
        include: {
          user: true,
          shifts: {
            include: { vehicle: { include: { model: true } } },
            orderBy: { startTime: 'desc' }
          },
          trips: {
            include: { vehicle: { include: { model: true } } },
          }
        }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      return res.json({
        success: true,
        data: {
          id: driver.id,
          name: driver.user.name,
          qid: driver.user.qid,
          phone: driver.user.phone,
          email: driver.user.email,
          licenseExpiry: driver.licenseExpiry,
          shifts: driver.shifts,
          trips: driver.trips
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, qid, phone, email, licenseExpiry } = req.body;

      if (!name || !phone || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name, phone, and email are required'
        });
      }

      // Create new user for driver (database will enforce uniqueness with userType)
      let user = await prisma.user.create({
          data: {
            name,
            email,
            phone,
            qid: qid || null,
            userType: 1, // Driver type
            isActive: true // Drivers are active by default
          }
        });

      // Create driver record linked to user
      const driver = await prisma.driver.create({
        data: {
          userId: user.id,
          licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null
        },
        include: {
          user: true
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          id: driver.id,
          name: driver.user.name,
          qid: driver.user.qid,
          phone: driver.user.phone,
          email: driver.user.email,
          licenseExpiry: driver.licenseExpiry
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, qid, phone, email, licenseExpiry } = req.body;

      // First get the driver to find the associated user
      const driver = await prisma.driver.findUnique({
        where: { id: BigInt(id) },
        include: { user: true }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Update user record (database will enforce uniqueness with userType)
      let updatedUser = await prisma.user.update({
          where: { id: driver.userId },
          data: {
            name: name || driver.user.name,
            email: email || driver.user.email,
            phone: phone || driver.user.phone,
            qid: qid !== undefined ? qid : driver.user.qid
          }
        });

      // Update driver record
      const updatedDriver = await prisma.driver.update({
        where: { id: BigInt(id) },
        data: {
          licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : driver.licenseExpiry
        },
        include: {
          user: true
        }
      });

      return res.json({
        success: true,
        data: {
          id: updatedDriver.id,
          name: updatedDriver.user.name,
          qid: updatedDriver.user.qid,
          phone: updatedDriver.user.phone,
          email: updatedDriver.user.email,
          licenseExpiry: updatedDriver.licenseExpiry
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: BigInt(id) },
        include: { user: true }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Delete driver (this will cascade delete the user due to the schema relationship)
      await prisma.driver.delete({
        where: { id: BigInt(id) }
      });

      return res.json({
        success: true,
        message: 'Driver deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getDriverShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // First verify driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: BigInt(id) },
        include: { user: true }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      const shifts = await prisma.shift.findMany({
        where: { driverId: BigInt(id) },
        include: {
          vehicle: { include: { model: true } }
        },
        orderBy: { startTime: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      return res.json({
        success: true,
        data: {
          driver: {
            id: driver.id,
            name: driver.user.name,
            qid: driver.user.qid,
            phone: driver.user.phone,
            email: driver.user.email,
            licenseExpiry: driver.licenseExpiry
          },
          shifts
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  // // OTP-based login for drivers
  // async generateOtp(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { phone } = req.body;

  //     if (!phone) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Phone number is required'
  //       });
  //     }

  //     // Check if driver exists with this phone number
  //     const driver = await prisma.driver.findFirst({
  //       where: { phone }
  //     });

  //     if (!driver) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Driver not found with this phone number'
  //       });
  //     }

  //     // Generate 6-digit OTP
  //     const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
  //     // Create or update UserAuth entry for OTP
  //     await prisma.userAuth.upsert({
  //       where: {
  //         identifier: phone
  //       },
  //       update: {
  //         provider: 'OTP',
  //         password: otp, // Store OTP as password for simplicity
  //         userType: "Driver",
  //         userId: driver.id
  //       },
  //       create: {
  //         userId: driver.id,
  //         userType: "Driver",
  //         provider: 'OTP',
  //         identifier: phone,
  //         password: otp
  //       }
  //     });

  //     // In production, you would send this OTP via SMS
  //     // For now, we'll return it in the response for testing
  //     console.log(`OTP for ${phone}: ${otp}`);

  //     return res.json({
  //       success: true,
  //       message: 'OTP generated successfully',
  //       data: {
  //         otp: otp
  //       }
  //     });
  //   } catch (error) {
  //     return next(error);
  //   }
  // },

  // async loginWithOtp(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { phone, otp } = req.body;

  //     if (!phone || !otp) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Phone number and OTP are required'
  //       });
  //     }

  //     // Find the UserAuth entry
  //     const userAuth = await prisma.userAuth.findFirst({
  //       where: {
  //         identifier: phone,
  //         provider: 'OTP'
  //       }
  //     });

  //     if (!userAuth) {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Invalid phone number or OTP'
  //       });
  //     }

  //     // Verify OTP
  //     if (userAuth.password !== otp) {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Invalid OTP'
  //       });
  //     }

  //     // Get driver details
  //     const driver = await prisma.driver.findUnique({
  //       where: { id: userAuth.userId }
  //     });

  //     if (!driver) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Driver not found'
  //       });
  //     }

  //     // Generate JWT token
  //     const token = jwt.sign(
  //       {
  //         id: driver.id.toString(),
  //         phone: driver.phone,
  //         type: 'driver'
  //       },
  //       config.jwtSecret,
  //       { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  //     );

  //     // Delete the OTP after successful login
  //     await prisma.userAuth.delete({
  //       where: { id: userAuth.id }
  //     });

  //     return res.json({
  //       success: true,
  //       data: {
  //         token,
  //         driver: {
  //           id: driver.id,
  //           name: driver.name,
  //           phone: driver.phone,
  //           email: driver.email,
  //           qid: driver.qid,
  //           type: 'driver'
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     return next(error);
  //   }
  // }
};
