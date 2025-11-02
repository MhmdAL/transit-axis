"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.driverController = {
    async getAllDrivers(req, res, next) {
        try {
            const drivers = await prisma.driver.findMany({
                include: {
                    shifts: {
                        include: { vehicle: { include: { model: true } } },
                        orderBy: { startTime: 'desc' }
                    }
                }
            });
            return res.json({
                success: true,
                data: drivers
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getDriverById(req, res, next) {
        try {
            const { id } = req.params;
            const driver = await prisma.driver.findUnique({
                where: { id: BigInt(id) },
                include: {
                    shifts: {
                        include: { vehicle: { include: { model: true } } },
                        orderBy: { startTime: 'desc' }
                    },
                    trips: {
                        include: { vehicle: { include: { model: true } } },
                        orderBy: { scheduledStartTime: 'desc' }
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
                data: driver
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async createDriver(req, res, next) {
    },
    async updateDriver(req, res, next) {
    },
    async deleteDriver(req, res, next) {
        try {
            const { id } = req.params;
            await prisma.driver.delete({
                where: { id: BigInt(id) }
            });
            return res.json({
                success: true,
                message: 'Driver deleted successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getDriverShifts(req, res, next) {
        try {
            const { id } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            const shifts = await prisma.shift.findMany({
                where: { driverId: BigInt(id) },
                include: {
                    vehicle: { include: { model: true } }
                },
                orderBy: { startTime: 'desc' },
                take: parseInt(limit),
                skip: parseInt(offset)
            });
            return res.json({
                success: true,
                data: shifts
            });
        }
        catch (error) {
            return next(error);
        }
    },
};
//# sourceMappingURL=driverController.js.map