import { Router } from 'express';
import { trackingController } from '../controllers/trackingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Vehicle tracking
router.post('/location', authMiddleware, trackingController.updateLocation);
router.get('/:vehicleId/current', authMiddleware, trackingController.getCurrentLocation);
router.get('/:vehicleId/history', authMiddleware, trackingController.getLocationHistory);
router.get('/live', trackingController.getLiveTracking); // WebSocket endpoint

export default router;

