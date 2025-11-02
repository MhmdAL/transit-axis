import { Router } from 'express';
import { routeController } from '../controllers/routeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Route management
router.get('/', authMiddleware, routeController.getAllRoutes);
router.get('/:id', authMiddleware, routeController.getRouteById);
router.post('/', authMiddleware, routeController.createRoute);
router.put('/:id', authMiddleware, routeController.updateRoute);
router.delete('/:id', authMiddleware, routeController.deleteRoute);
router.get('/:id/stops', authMiddleware, routeController.getRouteStops);

// Stop management
router.post('/:id/stops', authMiddleware, routeController.addStopToRoute);
router.put('/:routeId/stops/:stopId', authMiddleware, routeController.updateRouteStop);
router.delete('/:routeId/stops/:stopId', authMiddleware, routeController.removeStopFromRoute);

export default router;

