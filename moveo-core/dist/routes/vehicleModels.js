"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicleModelController_1 = require("../controllers/vehicleModelController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, vehicleModelController_1.vehicleModelController.getAllVehicleModels);
router.get('/search', authMiddleware_1.authMiddleware, vehicleModelController_1.vehicleModelController.searchVehicleModels);
router.get('/:id', authMiddleware_1.authMiddleware, vehicleModelController_1.vehicleModelController.getVehicleModelById);
router.post('/', authMiddleware_1.authMiddleware, vehicleModelController_1.vehicleModelController.createVehicleModel);
router.put('/:id', authMiddleware_1.authMiddleware, vehicleModelController_1.vehicleModelController.updateVehicleModel);
router.delete('/:id', authMiddleware_1.authMiddleware, vehicleModelController_1.vehicleModelController.deleteVehicleModel);
exports.default = router;
//# sourceMappingURL=vehicleModels.js.map