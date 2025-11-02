"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.tripController = {
    async getAllTrips(req, res, next) {
        try {
            const trips = await prisma.trip.findMany({
                include: {
                    route: true,
                    driver: true,
                    vehicle: { include: { model: true } },
                    tripStops: {
                        include: { stop: { include: { location: true } } },
                        orderBy: { stopOrder: 'asc' }
                    }
                },
                orderBy: { scheduledStartTime: 'desc' }
            });
            res.json({
                success: true,
                data: trips
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getTripById(req, res, next) {
        try {
            const { id } = req.params;
            const trip = await prisma.trip.findUnique({
                where: { id: BigInt(id) },
                include: {
                    route: {
                        include: {
                            routeStops: {
                                include: { stop: { include: { location: true } } },
                                orderBy: { stopOrder: 'asc' }
                            }
                        }
                    },
                    driver: true,
                    vehicle: { include: { model: true } },
                    tripStops: {
                        include: { stop: { include: { location: true } } },
                        orderBy: { stopOrder: 'asc' }
                    }
                }
            });
            if (!trip) {
                return res.status(404).json({
                    success: false,
                    message: 'Trip not found'
                });
            }
            res.json({
                success: true,
                data: trip
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async createTrip(req, res, next) {
        try {
            const { routeId, scheduledStartTime, scheduledEndTime } = req.body;
            const trip = await prisma.trip.create({
                data: {
                    routeId: BigInt(routeId),
                    scheduledStartTime: new Date(scheduledStartTime),
                    scheduledEndTime: new Date(scheduledEndTime)
                },
                include: {
                    route: true,
                    driver: true,
                    vehicle: { include: { model: true } }
                }
            });
            res.status(201).json({
                success: true,
                data: trip
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async assignDriverToTrip(req, res, next) {
        try {
            const { id } = req.params;
            const { driverId } = req.body;
            const trip = await prisma.trip.update({
                where: { id: BigInt(id) },
                data: {
                    scheduledDriverId: driverId,
                },
                include: {
                    driver: true,
                }
            });
            res.json({
                success: true,
                data: trip
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async assignVehicleToTrip(req, res, next) {
        try {
            const { id } = req.params;
            const { vehicleId } = req.body;
            const trip = await prisma.trip.update({
                where: { id: BigInt(id) },
                data: {
                    scheduledVehicleId: vehicleId,
                },
                include: {
                    vehicle: true,
                }
            });
            res.json({
                success: true,
                data: trip
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async updateTrip(req, res, next) {
        try {
            const { id } = req.params;
            const { routeId, scheduledStartTime, scheduledEndTime, scheduledDriverId, scheduledVehicleId, driverId, vehicleId } = req.body;
            const trip = await prisma.trip.update({
                where: { id: BigInt(id) },
                data: {
                    routeId: routeId ? BigInt(routeId) : undefined,
                    scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : undefined,
                    scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
                    scheduledDriverId: scheduledDriverId ? BigInt(scheduledDriverId) : undefined,
                    scheduledVehicleId: scheduledVehicleId ? BigInt(scheduledVehicleId) : undefined,
                    driverId: driverId ? BigInt(driverId) : undefined,
                    vehicleId: vehicleId ? BigInt(vehicleId) : undefined
                },
                include: {
                    route: true,
                    driver: true,
                    vehicle: { include: { model: true } }
                }
            });
            res.json({
                success: true,
                data: trip
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async deleteTrip(req, res, next) {
        try {
            const { id } = req.params;
            await prisma.trip.delete({
                where: { id: BigInt(id) }
            });
            res.json({
                success: true,
                message: 'Trip deleted successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async startTrip(req, res, next) {
        try {
            const { id } = req.params;
            const { startLocation } = req.body;
            const trip = await prisma.trip.update({
                where: { id: BigInt(id) },
                data: {
                    startTime: new Date(),
                    startLocation: startLocation ? BigInt(startLocation) : undefined
                },
                include: {
                    route: true,
                    driver: true,
                    vehicle: { include: { model: true } }
                }
            });
            res.json({
                success: true,
                data: trip,
                message: 'Trip started successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async endTrip(req, res, next) {
        try {
            const { id } = req.params;
            const { endLocation } = req.body;
            const trip = await prisma.trip.update({
                where: { id: BigInt(id) },
                data: {
                    endTime: new Date(),
                    endLocation: endLocation ? BigInt(endLocation) : undefined
                },
                include: {
                    route: true,
                    driver: true,
                    vehicle: { include: { model: true } }
                }
            });
            res.json({
                success: true,
                data: trip,
                message: 'Trip ended successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getTripStops(req, res, next) {
        try {
            const { id } = req.params;
            const tripStops = await prisma.tripStop.findMany({
                where: { tripId: BigInt(id) },
                include: {
                    stop: { include: { location: true } }
                },
                orderBy: { stopOrder: 'asc' }
            });
            res.json({
                success: true,
                data: tripStops
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async arriveAtStop(req, res, next) {
        try {
            const { id: tripId, stopId } = req.params;
            const tripStop = await prisma.tripStop.update({
                where: {
                    id: BigInt(stopId)
                },
                data: {
                    arrivalTime: new Date()
                },
                include: {
                    stop: { include: { location: true } }
                }
            });
            res.json({
                success: true,
                data: tripStop,
                message: 'Arrived at stop successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async departFromStop(req, res, next) {
        try {
            const { id: tripId, stopId } = req.params;
            const tripStop = await prisma.tripStop.update({
                where: {
                    id: BigInt(stopId)
                },
                data: {
                    departureTime: new Date()
                },
                include: {
                    stop: { include: { location: true } }
                }
            });
            res.json({
                success: true,
                data: tripStop,
                message: 'Departed from stop successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    }
};
//# sourceMappingURL=tripController.js.map