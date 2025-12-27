import express from 'express';
import * as policyController from '../controllers/policyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// Public routes
router.get('/', policyController.getPolicies);
router.get('/:slug', policyController.getPolicy);

// Admin routes
router.put('/:slug', 
    authenticateToken, 
    checkRole(ADMIN_ROLES), 
    policyController.updatePolicy
);

export default router;
