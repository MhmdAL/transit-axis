"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.trackingController = {
    async updateLocation(req, res, next) {
        try {
            const { vehicleId, lat, lon, speed, ignition } = req.body;
            const telemetry = await prisma.vehicleTelemetry.create({
                data: {
                    vehicleId: BigInt(vehicleId),
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    speed: speed ? parseFloat(speed) : null,
                    ignition: Boolean(ignition)
                }
            });
            await prisma.vehicleTelemetryHistory.create({
                data: {
                    vehicleId: BigInt(vehicleId),
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    speed: speed ? parseFloat(speed) : null,
                    ignition: Boolean(ignition),
                    trackedOn: new Date()
                }
            });
            res.json({
                success: true,
                data: telemetry,
                message: 'Location updated successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getCurrentLocation(req, res, next) {
        try {
            const { vehicleId } = req.params;
            const latestTelemetry = await prisma.vehicleTelemetry.findFirst({
                where: { vehicleId: BigInt(vehicleId) },
                orderBy: { trackedOn: 'desc' }
            });
            if (!latestTelemetry) {
                return res.status(404).json({
                    success: false,
                    message: 'No location data found for this vehicle'
                });
            }
            res.json({
                success: true,
                data: {
                    lat: latestTelemetry.lat,
                    lon: latestTelemetry.lon,
                    speed: latestTelemetry.speed,
                    ignition: latestTelemetry.ignition,
                    trackedOn: latestTelemetry.trackedOn
                }
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getLocationHistory(req, res, next) {
        try {
            const { vehicleId } = req.params;
            const { startDate, endDate, limit = 1000, offset = 0 } = req.query;
            const whereClause = {
                vehicleId: BigInt(vehicleId)
            };
            if (startDate && endDate) {
                whereClause.trackedOn = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            const history = await prisma.vehicleTelemetryHistory.findMany({
                where: whereClause,
                orderBy: { trackedOn: 'desc' },
                take: parseInt(limit),
                skip: parseInt(offset)
            });
            res.json({
                success: true,
                data: history
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getLiveTracking(req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Live tracking endpoint - use WebSocket for real-time updates',
                data: {
                    vehicles: [],
                    message: 'Connect to WebSocket for live tracking data'
                }
            });
        }
        catch (error) {
            return next(error);
        }
    }
};
//# sourceMappingURL=trackingController.js.map