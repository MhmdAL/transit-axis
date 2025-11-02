import { Router } from 'express';
import { serviceScheduleController } from '../controllers/serviceScheduleController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Service Schedule routes
router.get('/', authMiddleware, serviceScheduleController.getAllServiceSchedules);
router.get('/:id', authMiddleware, serviceScheduleController.getServiceScheduleById);
router.post('/', authMiddleware, serviceScheduleController.createServiceSchedule);
router.put('/:id', authMiddleware, serviceScheduleController.updateServiceSchedule);
router.delete('/:id', authMiddleware, serviceScheduleController.deleteServiceSchedule);

// Duty Template routes
router.get('/:scheduleId/templates', authMiddleware, serviceScheduleController.getDutyTemplates);
router.post('/:scheduleId/templates', authMiddleware, serviceScheduleController.createDutyTemplate);
router.put('/:scheduleId/templates/:templateId', authMiddleware, serviceScheduleController.updateDutyTemplate);
router.delete('/:scheduleId/templates/:templateId', authMiddleware, serviceScheduleController.deleteDutyTemplate);

export default router;
