"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleModelController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.vehicleModelController = {
    async getAllVehicleModels(req, res, next) {
        try {
            const models = await prisma.vehicleModel.findMany();
            res.json({
                success: true,
                data: models
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async searchVehicleModels(req, res, next) {
        try {
            const { search } = req.query;
            if (!search || typeof search !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search parameter is required'
                });
            }
            const models = await prisma.vehicleModel.findMany({
                where: {
                    OR: [
                        { make: { contains: search, mode: 'insensitive' } },
                        { manufacturer: { contains: search, mode: 'insensitive' } },
                        { year: { equals: parseInt(search) || undefined } }
                    ]
                },
                take: 10
            });
            res.json({
                success: true,
                data: models
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async getVehicleModelById(req, res, next) {
        try {
            const { id } = req.params;
            const model = await prisma.vehicleModel.findUnique({
                where: { id: BigInt(id) }
            });
            if (!model) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle model not found'
                });
            }
            res.json({
                success: true,
                data: model
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async createVehicleModel(req, res, next) {
        try {
            const { make, year, manufacturer, capacity } = req.body;
            const model = await prisma.vehicleModel.create({
                data: {
                    make,
                    year,
                    manufacturer,
                    capacity
                }
            });
            res.status(201).json({
                success: true,
                data: model
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async updateVehicleModel(req, res, next) {
        try {
            const { id } = req.params;
            const { make, year, manufacturer, capacity } = req.body;
            const model = await prisma.vehicleModel.update({
                where: { id: BigInt(id) },
                data: {
                    make,
                    year,
                    manufacturer,
                    capacity
                }
            });
            res.json({
                success: true,
                data: model
            });
        }
        catch (error) {
            return next(error);
        }
    },
    async deleteVehicleModel(req, res, next) {
        try {
            const { id } = req.params;
            await prisma.vehicleModel.delete({
                where: { id: BigInt(id) }
            });
            res.json({
                success: true,
                message: 'Vehicle model deleted successfully'
            });
        }
        catch (error) {
            return next(error);
        }
    }
};
//# sourceMappingURL=vehicleModelController.js.map