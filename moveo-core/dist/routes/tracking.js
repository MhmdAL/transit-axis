"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trackingController_1 = require("../controllers/trackingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/location', authMiddleware_1.authMiddleware, trackingController_1.trackingController.updateLocation);
router.get('/:vehicleId/current', authMiddleware_1.authMiddleware, trackingController_1.trackingController.getCurrentLocation);
router.get('/:vehicleId/history', authMiddleware_1.authMiddleware, trackingController_1.trackingController.getLocationHistory);
router.get('/live', trackingController_1.trackingController.getLiveTracking);
exports.default = router;
//# sourceMappingURL=tracking.js.map