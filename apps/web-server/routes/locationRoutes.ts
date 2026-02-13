import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = Router();

// Public routes
router.get('/', locationController.getLocations);

// Admin routes
router.post('/', authenticateToken, checkRole(STAFF_ROLES), locationController.createLocation);
router.put('/:id', authenticateToken, checkRole(STAFF_ROLES), locationController.updateLocation);
router.delete('/:id', authenticateToken, checkRole(STAFF_ROLES), locationController.deleteLocation);

export default router;
