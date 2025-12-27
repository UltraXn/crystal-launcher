import express from 'express';
import * as donationController from '../controllers/donationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

router.get('/stats', donationController.getStats);

// Administrative routes
router.use(authenticateToken);
router.use(checkRole(ADMIN_ROLES));

router.get('/', donationController.getDonations);
router.post('/', donationController.createDonation);
router.put('/:id', donationController.updateDonation);
router.delete('/:id', donationController.deleteDonation);

export default router;
