"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const config_1 = require("../config/config");
const emailService_1 = __importDefault(require("../services/emailService"));
const prisma = new client_1.PrismaClient();
exports.authController = {
    async createUser(req, res, next) {
        try {
            const { name, email, phone } = req.body;
            if (!name || !phone || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, phone, and email are required'
                });
            }
            const existingUserByPhone = await prisma.user.findUnique({
                where: { phone }
            });
            if (existingUserByPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone already exists'
                });
            }
            const existingUserByEmail = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUserByEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            const activationCode = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    phone,
                    isActive: false,
                    userType: 0
                }
            });
            const activation = await prisma.userActivation.create({
                data: {
                    userId: user.id,
                    activationCode,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
            const emailSent = await emailService_1.default.sendActivationEmail(email, activationCode, name);
            if (!emailSent) {
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
        }
        catch (error) {
            return next(error);
        }
    },
    async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let whereClause = {};
            if (search) {
                whereClause = {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { username: { contains: search, mode: 'insensitive' } }
                    ]
                };
            }
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where: whereClause,
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
                    roles: user.roles.map(ur => ur.role.name)
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
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
        }
        catch (error) {
            return next(error);
        }
    },
    async refreshToken(req, res, next) {
        return res.json({ success: true, message: 'Token refresh endpoint' });
    },
    async logout(req, res, next) {
        return res.json({ success: true, message: 'Logged out successfully' });
    },
    async activateAccount(req, res, next) {
        try {
            const { activationCode, password, username } = req.body;
            if (!activationCode || !password || !username) {
                return res.status(400).json({
                    success: false,
                    message: 'Activation code, password, and username are required'
                });
            }
            const existingUserAuth = await prisma.userAuth.findUnique({
                where: { identifier: username }
            });
            if (existingUserAuth) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
            const activation = await prisma.userActivation.findFirst({
                where: {
                    activationCode,
                    isUsed: false,
                    expiresAt: {
                        gt: new Date()
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
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            await prisma.userAuth.create({
                data: {
                    userId: activation.user.id,
                    userType: 'User',
                    provider: 'PASSWORD',
                    identifier: username,
                    password: hashedPassword
                }
            });
            await prisma.user.update({
                where: { id: activation.user.id },
                data: { isActive: true }
            });
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
        }
        catch (error) {
            return next(error);
        }
    },
    async loginWithPassword(req, res, next) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }
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
            const isPasswordValid = await bcryptjs_1.default.compare(password, userAuth.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }
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
            const token = jsonwebtoken_1.default.sign({
                id: user.id.toString(),
                username: userAuth.identifier,
                type: 'user'
            }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
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
        }
        catch (error) {
            return next(error);
        }
    },
};
//# sourceMappingURL=authController.js.map