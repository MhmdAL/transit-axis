"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicleController_1 = require("../controllers/vehicleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.getAllVehicles);
router.get('/:id', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.getVehicleById);
router.post('/', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.createVehicle);
router.put('/:id', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.updateVehicle);
router.delete('/:id', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.deleteVehicle);
router.get('/:id/location', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.getVehicleLocation);
router.get('/:id/telemetry', authMiddleware_1.authMiddleware, vehicleController_1.vehicleController.getVehicleTelemetry);
exports.default = router;
//# sourceMappingURL=vehicles.js.map