"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driverController_1 = require("../controllers/driverController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, driverController_1.driverController.getAllDrivers);
router.get('/:id', authMiddleware_1.authMiddleware, driverController_1.driverController.getDriverById);
router.post('/', driverController_1.driverController.createDriver);
router.put('/:id', authMiddleware_1.authMiddleware, driverController_1.driverController.updateDriver);
router.delete('/:id', authMiddleware_1.authMiddleware, driverController_1.driverController.deleteDriver);
router.get('/:id/shifts', authMiddleware_1.authMiddleware, driverController_1.driverController.getDriverShifts);
exports.default = router;
//# sourceMappingURL=drivers.js.map