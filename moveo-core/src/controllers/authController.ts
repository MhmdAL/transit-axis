import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import emailService from '../services/emailService';

const prisma = new PrismaClient();

export const authController = {
  // Create new user with email activation
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone } = req.body;

      if (!name || !phone || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name, phone, and email are required'
        });
      }

      // Check if username already exists
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone_userType: { phone: phone, userType: 0 } }
      });

      if (existingUserByPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone already exists'
        });
      }

      // Check if email already exists
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email_userType: { email: email, userType: 0 } }
      });

      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Generate activation code
      const activationCode = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);

      // Create user (inactive by default)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          isActive: false,
          userType: 0
        }
      });

      // Create activation record
      const activation = await prisma.userActivation.create({
        data: {
          userId: user.id,
          activationCode,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      });

      // Send activation email
      const emailSent = await emailService.sendActivationEmail(email, activationCode, name);
      
      if (!emailSent) {
        // If email fails, clean up the user and activation records
        await prisma.userActivation.delete({ where: { id: activation.id } });
        await prisma.user.delete({ where: { id: user.id } });
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send activation email. Please try again.'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email for activation instructions.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isActive: user.isActive
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get all users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      
      // if (search) {
      //   whereClause = {
      //     OR: [
      //       { name: { contains: search as string, mode: 'insensitive' } },
      //       { username: { contains: search as string, mode: 'insensitive' } }
      //     ]
      //   };
      // }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {userType: 0},
          skip,
          take: Number(limit),
          orderBy: { name: 'asc' },
          include: { roles: { include: { role: true } }, userAuths: true }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      return res.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          username: user.userAuths?.[0]?.identifier ?? 'N/A',
          name: user.name,
          phone: user.phone,
          email: user.email,
          type: 'user',
          roles: user.roles.map(ur => ur.role.name),
          isActive: user.isActive
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  // Get user profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: { roles: { include: { role: true } }, userAuths: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.json({
        success: true,
        data: {
          id: user.id,
          username: user.userAuths?.[0]?.identifier ?? 'N/A',
          name: user.name,
          email: user.email,
          phone: user.phone,
          type: 'user',
          roles: user.roles.map(ur => ur.role.name)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    // Implementation for token refresh
    return res.json({ success: true, message: 'Token refresh endpoint' });
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    // Implementation for logout (token blacklisting if needed)
    return res.json({ success: true, message: 'Logged out successfully' });
  },

  // Activate user account and set username/password
  async activateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { activationCode, password, username } = req.body;

      if (!activationCode || !password || !username) {
        return res.status(400).json({
          success: false,
          message: 'Activation code, password, and username are required'
        });
      }

      // Check if username already exists
      const existingUserAuth = await prisma.userAuth.findUnique({
        where: { identifier: username }
      });

      if (existingUserAuth) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Find the activation record
      const activation = await prisma.userActivation.findFirst({
        where: {
          activationCode,
          isUsed: false,
          expiresAt: {
            gt: new Date() // Not expired
          }
        },
        include: {
          user: true
        }
      });

      if (!activation) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired activation code'
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create UserAuth entry for password authentication
      await prisma.userAuth.create({
        data: {
          userId: activation.user.id,
          userType: 'User',
          provider: 'PASSWORD',
          identifier: username,
          password: hashedPassword
        }
      });

      // Mark user as active
      await prisma.user.update({
        where: { id: activation.user.id },
        data: { isActive: true }
      });

      // Mark activation as used
      await prisma.userActivation.update({
        where: { id: activation.id },
        data: { isUsed: true }
      });

      return res.json({
        success: true,
        message: 'Account activated successfully. You can now login with your username and password.',
        data: {
          id: activation.user.id,
          username: username,
          name: activation.user.name,
          email: activation.user.email,
          userType: activation.user.userType,
          isActive: true
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  // Login with password
  async loginWithPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find the UserAuth entry for password authentication
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          identifier: username,
          provider: 'PASSWORD',
          userType: 'User'
        }
      });

      if (!userAuth) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userAuth.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userAuth.userId },
        include: { roles: { include: { role: true } } }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is not activated. Please check your email for activation instructions.'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id.toString(),
          username: userAuth.identifier,
          type: 'user'
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: userAuth.identifier,
            name: user.name,
            email: user.email,
            type: 'user',
            isActive: user.isActive
          }
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  // Driver login with email and password
  async driverLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find the UserAuth entry for driver password authentication
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          identifier: email,
          provider: 'PASSWORD',
          userType: 'Driver'
        }
      });

      if (!userAuth) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password2'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userAuth.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password3'
        });
      }

      // Get driver details with user info
      const driver = await prisma.driver.findUnique({
        where: { userId: userAuth.userId },
        include: { user: true }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      if (!driver.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Driver account is not active'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: driver.id.toString(),
          email: email,
          type: 'driver'
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      return res.json({
        success: true,
        data: {
          token,
          driver: {
            id: driver.id,
            email: email,
            name: driver.user.name,
            phone: driver.user.phone,
            licenseExpiry: driver.licenseExpiry,
            isActive: driver.user.isActive,
            type: 'driver'
          }
        }
      });
    } catch (error) {
      return next(error);
    }
  },
};
