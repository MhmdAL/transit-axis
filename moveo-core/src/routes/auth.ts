import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Authentication routes (OTP-only)
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// User management routes
router.post('/users', authController.createUser);

// OTP authentication routes
// router.post('/generate-otp', authController.generateOtp);
// router.post('/login-otp', authController.loginWithOtp);

// Password authentication routes
router.post('/activate', authController.activateAccount);
router.post('/login-password', authController.loginWithPassword);
// router.post('/request-password-reset', authController.requestPasswordReset);
// router.post('/reset-password', authController.resetPassword);

// Driver authentication routes
router.post('/driver-login', authController.driverLogin);

// Protected routes
router.get('/users', authMiddleware, authController.getAllUsers);
router.get('/profile', authMiddleware, authController.getProfile);

export default router;

