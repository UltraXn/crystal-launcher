import { Router } from 'express';
import { linkAccount } from '../controllers/discordController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/discord/link
router.post('/link', authenticateToken, linkAccount);

export default router;
