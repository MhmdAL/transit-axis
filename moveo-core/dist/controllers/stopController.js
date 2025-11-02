"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.stopController = {
    async getAllStops(req, res, next) {
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
        }
        catch (error) {
            return next(error);
        }
    },
    async getStopById(req, res, next) {
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
        }
        catch (error) {
            return next(error);
        }
    },
    async createStop(req, res, next) {
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
        }
        catch (error) {
            return next(error);
        }
    },
};
//# sourceMappingURL=stopController.js.map