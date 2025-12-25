import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as commandService from '../services/commandService.js';
import { isAdmin } from '../utils/roleUtils.js';

const router = express.Router();

// POST /api/bridge/queue - Queue a command (Admin only)
router.post('/queue', authenticateToken, async (req, res) => {
    // Basic permissions check
    if (!req.user || !isAdmin(req.user.role)) {
         return res.status(403).json({ error: 'Access denied' });
    }

    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    const result = await commandService.queueCommand(command);
    if (result.success) {
        res.json({ message: 'Command queued successfully', id: result.id });
    } else {
        res.status(500).json({ error: 'Failed to queue command' });
    }
});

export default router;
