import { Router } from 'express';
import { dutyController } from '../controllers/dutyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Duty routes
router.get('/', authMiddleware, dutyController.getAllDuties);
router.get('/date/:date', authMiddleware, dutyController.getDutiesByDate);
router.get('/driver/:driverId', authMiddleware, dutyController.getDutiesByDriver);
router.get('/vehicle/:vehicleId', authMiddleware, dutyController.getDutiesByVehicle);
router.get('/:id', authMiddleware, dutyController.getDutyById);
router.post('/', authMiddleware, dutyController.createDuty);
router.post('/bulk-trips', authMiddleware, dutyController.createBulkTripDuties);
router.put('/bulk-assignments', authMiddleware, dutyController.bulkUpdateDutyAssignments);
router.put('/:id', authMiddleware, dutyController.updateDuty);
router.delete('/:id', authMiddleware, dutyController.deleteDuty);

export default router;
