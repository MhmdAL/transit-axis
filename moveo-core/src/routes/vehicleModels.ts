import { Router } from 'express';
import { vehicleModelController } from '../controllers/vehicleModelController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, vehicleModelController.getAllVehicleModels);
router.get('/search', authMiddleware, vehicleModelController.searchVehicleModels);
router.get('/:id', authMiddleware, vehicleModelController.getVehicleModelById);
router.post('/', authMiddleware, vehicleModelController.createVehicleModel);
router.put('/:id', authMiddleware, vehicleModelController.updateVehicleModel);
router.delete('/:id', authMiddleware, vehicleModelController.deleteVehicleModel);

export default router;
