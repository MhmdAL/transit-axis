"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.routeController = {
    async getAllRoutes(req, res, next) {
        try {
            const routes = await prisma.route.findMany({
                include: {
                    routeStops: {
                        include: { stop: { include: { location: true } } },
                        orderBy: { stopOrder: 'asc' }
                    }
                }
            });
            res.json({
                success: true,
                data: routes
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getRouteById(req, res, next) {
        try {
            const { id } = req.params;
            const route = await prisma.route.findUnique({
                where: { id: BigInt(id) },
                include: {
                    routeStops: {
                        include: { stop: { include: { location: true } } },
                        orderBy: { stopOrder: 'asc' }
                    }
                }
            });
            if (!route) {
                return res.status(404).json({
                    success: false,
                    message: 'Route not found'
                });
            }
            res.json({
                success: true,
                data: route
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async createRoute(req, res, next) {
        try {
            const { name, code, stops } = req.body;
            const route = await prisma.route.create({
                data: {
                    name,
                    code,
                    isActive: true,
                    totalEstimatedDuration: 0,
                    routeStops: {
                        create: stops.map((stop) => ({
                            stopId: BigInt(stop.id),
                            stopOrder: parseInt(stop.order),
                            isActive: true
                        }))
                    }
                },
                include: {
                    routeStops: {
                        include: {
                            stop: { include: { location: true } }
                        },
                        orderBy: { stopOrder: 'asc' }
                    }
                }
            });
            res.status(201).json({
                success: true,
                data: route
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async updateRoute(req, res, next) {
        try {
            const { id } = req.params;
            const { name, code, isActive, totalEstimatedDuration } = req.body;
            const route = await prisma.route.update({
                where: { id: BigInt(id) },
                data: {
                    name,
                    code,
                    isActive,
                    totalEstimatedDuration
                }
            });
            res.json({
                success: true,
                data: route
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async deleteRoute(req, res, next) {
        try {
            const { id } = req.params;
            await prisma.route.delete({
                where: { id: BigInt(id) }
            });
            res.json({
                success: true,
                message: 'Route deleted successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getRouteStops(req, res, next) {
        try {
            const { id } = req.params;
            const routeStops = await prisma.routeStop.findMany({
                where: { routeId: BigInt(id) },
                include: {
                    stop: { include: { location: true } }
                },
                orderBy: { stopOrder: 'asc' }
            });
            res.json({
                success: true,
                data: routeStops
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async addStopToRoute(req, res, next) {
        try {
            const { id: routeId } = req.params;
            const { stopId, stopOrder, eta, waitTime } = req.body;
            const routeStop = await prisma.routeStop.create({
                data: {
                    routeId: BigInt(routeId),
                    stopId: BigInt(stopId),
                    stopOrder,
                    eta,
                    waitTime
                },
                include: {
                    stop: { include: { location: true } }
                }
            });
            res.status(201).json({
                success: true,
                data: routeStop
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async updateRouteStop(req, res, next) {
        try {
            const { routeId, stopId } = req.params;
            const { stopOrder, isActive, eta, waitTime } = req.body;
            const routeStop = await prisma.routeStop.update({
                where: {
                    id: BigInt(stopId)
                },
                data: {
                    stopOrder,
                    isActive,
                    eta,
                    waitTime
                },
                include: {
                    stop: { include: { location: true } }
                }
            });
            res.json({
                success: true,
                data: routeStop
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async removeStopFromRoute(req, res, next) {
        try {
            const { stopId } = req.params;
            await prisma.routeStop.delete({
                where: { id: BigInt(stopId) }
            });
            res.json({
                success: true,
                message: 'Stop removed from route successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    }
};
//# sourceMappingURL=routeController.js.map