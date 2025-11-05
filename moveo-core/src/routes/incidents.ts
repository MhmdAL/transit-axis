import { Router } from 'express';
import { incidentController } from '../controllers/incidentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Get incidents by trip
router.get('/trip/:tripId', authMiddleware, incidentController.getIncidentsByTrip);

// Create incident
router.post('/', authMiddleware, incidentController.createIncident);

// Resolve incident
router.post('/:id/resolve', authMiddleware, incidentController.resolveIncident);

// Update incident status
router.post('/:id/status', authMiddleware, incidentController.updateIncidentStatus);

export default router;

