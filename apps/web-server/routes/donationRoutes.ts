import express from 'express';
import { testDonation, getDonations, createDonation, updateDonation, deleteDonation, getDonationStats } from '../controllers/donationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to trigger test donation (admin/staff only theoretically, but for now just auth)
router.post('/test', authenticateToken, testDonation);

// CRUD Routes
router.get('/', authenticateToken, getDonations);
router.post('/', authenticateToken, createDonation);
router.get('/stats', authenticateToken, getDonationStats); // New stats endpoint
router.put('/:id', authenticateToken, updateDonation);
router.delete('/:id', authenticateToken, deleteDonation);

export default router;
