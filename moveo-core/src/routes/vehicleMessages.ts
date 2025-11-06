import { Router } from 'express';
import { vehicleMessageController } from '../controllers/vehicleMessageController';
import { vehicleMessageTemplateController } from '../controllers/vehicleMessageTemplateController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Template endpoints
router.get('/templates/all', authMiddleware, vehicleMessageTemplateController.getMessageTemplates);
router.get('/templates/:categoryId', authMiddleware, vehicleMessageTemplateController.getTemplatesByCategory);

// Get all vehicle messages with optional filters
router.get('/', authMiddleware, vehicleMessageController.getAllVehicleMessages);

// Get vehicle message by ID
router.get('/:id', authMiddleware, vehicleMessageController.getVehicleMessageById);

// Get all messages for a specific vehicle
router.get('/vehicle/:vehicleId', authMiddleware, vehicleMessageController.getMessagesByVehicle);

// Create a new vehicle message
router.post('/', authMiddleware, vehicleMessageController.createVehicleMessage);

// Update a vehicle message
router.put('/:id', authMiddleware, vehicleMessageController.updateVehicleMessage);

// Delete a vehicle message
router.delete('/:id', authMiddleware, vehicleMessageController.deleteVehicleMessage);

export default router;

