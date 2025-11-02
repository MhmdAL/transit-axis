import { Router } from 'express';
import { trackingController } from '../controllers/trackingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Vehicle tracking
router.get('/live', trackingController.getLiveTracking); // WebSocket endpoint
router.post('/vehicles-telemetry', trackingController.getMultipleVehiclesTelemetry);
router.get('/trips/:tripId/path', trackingController.getTripPath);
router.get('/vehicles/:vehicleId/path', trackingController.getTimeRangePath);

export default router;

