"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const client_1 = require("@prisma/client");
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
require("./utils/bigIntSerializer");
const auth_1 = __importDefault(require("./routes/auth"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const drivers_1 = __importDefault(require("./routes/drivers"));
const routes_1 = __importDefault(require("./routes/routes"));
const stops_1 = __importDefault(require("./routes/stops"));
const vehicleModels_1 = __importDefault(require("./routes/vehicleModels"));
const trips_1 = __importDefault(require("./routes/trips"));
const tracking_1 = __importDefault(require("./routes/tracking"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/vehicle-models', vehicleModels_1.default);
app.use('/api/drivers', drivers_1.default);
app.use('/api/routes', routes_1.default);
app.use('/api/stops', stops_1.default);
app.use('/api/trips', trips_1.default);
app.use('/api/tracking', tracking_1.default);
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
const PORT = config_1.config.port || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Fleet Management API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}${config_1.config.apiDocsPath}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map