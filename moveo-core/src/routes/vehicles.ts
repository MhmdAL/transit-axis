import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Vehicle routes
router.get('/', authMiddleware, vehicleController.getAllVehicles);
router.get('/:id', authMiddleware, vehicleController.getVehicleById);
router.post('/', authMiddleware, vehicleController.createVehicle);
router.put('/:id', authMiddleware, vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

export default router;
