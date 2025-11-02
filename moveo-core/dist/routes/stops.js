"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stopController_1 = require("../controllers/stopController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, stopController_1.stopController.getAllStops);
router.get('/:id', authMiddleware_1.authMiddleware, stopController_1.stopController.getStopById);
router.post('/', authMiddleware_1.authMiddleware, stopController_1.stopController.createStop);
exports.default = router;
//# sourceMappingURL=stops.js.map