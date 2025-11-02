import { Router } from 'express';
import { driverController } from '../controllers/driverController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Driver routes
router.get('/', authMiddleware, driverController.getAllDrivers);
router.get('/:id', authMiddleware, driverController.getDriverById);
router.post('/', driverController.createDriver);
router.put('/:id', authMiddleware, driverController.updateDriver);
router.delete('/:id', authMiddleware, driverController.deleteDriver);
router.get('/:id/shifts', authMiddleware, driverController.getDriverShifts);

// Driver OTP authentication routes (no auth middleware needed)
// router.post('/generate-otp', driverController.generateOtp);
// router.post('/login-otp', driverController.loginWithOtp);

export default router;

