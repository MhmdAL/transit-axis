"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeController_1 = require("../controllers/routeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, routeController_1.routeController.getAllRoutes);
router.get('/:id', authMiddleware_1.authMiddleware, routeController_1.routeController.getRouteById);
router.post('/', authMiddleware_1.authMiddleware, routeController_1.routeController.createRoute);
router.put('/:id', authMiddleware_1.authMiddleware, routeController_1.routeController.updateRoute);
router.delete('/:id', authMiddleware_1.authMiddleware, routeController_1.routeController.deleteRoute);
router.get('/:id/stops', authMiddleware_1.authMiddleware, routeController_1.routeController.getRouteStops);
router.post('/:id/stops', authMiddleware_1.authMiddleware, routeController_1.routeController.addStopToRoute);
router.put('/:routeId/stops/:stopId', authMiddleware_1.authMiddleware, routeController_1.routeController.updateRouteStop);
router.delete('/:routeId/stops/:stopId', authMiddleware_1.authMiddleware, routeController_1.routeController.removeStopFromRoute);
exports.default = router;
//# sourceMappingURL=routes.js.map