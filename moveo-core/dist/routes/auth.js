"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/refresh', authController_1.authController.refreshToken);
router.post('/logout', authController_1.authController.logout);
router.post('/users', authController_1.authController.createUser);
router.post('/activate', authController_1.authController.activateAccount);
router.post('/login-password', authController_1.authController.loginWithPassword);
router.get('/users', authMiddleware_1.authMiddleware, authController_1.authController.getAllUsers);
router.get('/profile', authMiddleware_1.authMiddleware, authController_1.authController.getProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map