import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as commandService from '../services/commandService.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// POST /api/bridge/queue - Queue a command (Admin only)
router.post('/queue', authenticateToken, checkRole(ADMIN_ROLES), async (req, res) => {
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
