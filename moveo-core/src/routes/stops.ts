import { Router } from 'express';
import { stopController } from '../controllers/stopController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Route management
router.get('/', authMiddleware, stopController.getAllStops);
router.get('/:id', authMiddleware, stopController.getStopById);
router.post('/', authMiddleware, stopController.createStop);
// router.put('/:id', authMiddleware, stopController.updateRoute);
// router.delete('/:id', authMiddleware, stopController.deleteRoute);
// router.get('/:id/stops', authMiddleware, stopController.getRouteStops);

// Stop management
// router.post('/:id/stops', authMiddleware, stopController.addStopToRoute);
// router.put('/:routeId/stops/:stopId', authMiddleware, stopController.updateRouteStop);
// router.delete('/:routeId/stops/:stopId', authMiddleware, stopController.removeStopFromRoute);

export default router;
