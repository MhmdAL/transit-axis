import express from 'express';
import { telemetryController } from '../controllers/telemetryController';

const router = express.Router();

router.post('/', telemetryController.createTelemetry);
router.get('/', telemetryController.listTelemetry);
router.get('/:vehicleId', telemetryController.getTelemetryByVehicle);
router.get('/:vehicleId/logs', telemetryController.getTelemetryLogs);
router.get('/:vehicleId/path', telemetryController.getTelemetryPath);

export default router;

