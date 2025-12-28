import express from 'express';
import * as pollController from '../controllers/pollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

router.get('/', pollController.getPolls);
router.get('/active', pollController.getActivePoll);
router.post('/vote', authenticateToken, pollController.vote);
router.post('/create', authenticateToken, checkRole(ADMIN_ROLES), pollController.create);
router.put('/update/:id', authenticateToken, checkRole(ADMIN_ROLES), pollController.update);
router.post('/close/:id', authenticateToken, checkRole(ADMIN_ROLES), pollController.close);

export default router;
