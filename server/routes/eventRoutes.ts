import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

router.get('/my-registrations', authenticateToken, eventController.getUserRegistrations);
router.get('/:id/registrations', authenticateToken, checkRole(STAFF_ROLES), eventController.getEventRegistrations);
router.get('/', eventController.getAllEvents);
router.post('/', authenticateToken, checkRole(ADMIN_ROLES), eventController.createEvent);
router.put('/:id', authenticateToken, checkRole(ADMIN_ROLES), eventController.updateEvent);
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), eventController.deleteEvent);
router.post('/:id/register', authenticateToken, eventController.registerForEvent);

export default router;
