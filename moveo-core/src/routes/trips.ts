import { Router } from 'express';
import { tripController } from '../controllers/tripController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Trip management
router.get('/', authMiddleware, tripController.getAllTrips);
router.get('/:id', authMiddleware, tripController.getTripById);
router.post('/', authMiddleware, tripController.createTrip);
router.put('/:id', authMiddleware, tripController.updateTrip);
router.delete('/:id', authMiddleware, tripController.deleteTrip);

// Trip duties - must come before :id routes
router.get('/duties/by-date-routes', authMiddleware, tripController.getTripDutiesByDateAndRoutes);

// Trip details endpoint
router.get('/:id/details', authMiddleware, tripController.getTripDetails);

// Trip operations
router.post('/:id/start', authMiddleware, tripController.startTrip);
router.post('/:id/end', authMiddleware, tripController.endTrip);
router.get('/:id/stops', authMiddleware, tripController.getTripStops);
router.put('/:id/stops/:stopId/arrive', authMiddleware, tripController.arriveAtStop);
router.put('/:id/stops/:stopId/depart', authMiddleware, tripController.departFromStop);

export default router;

