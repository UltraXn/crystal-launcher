import express from 'express';
import { authenticateToken, require2FA } from '../middleware/authMiddleware.js';
import * as commandService from '../services/commandService.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// POST /api/bridge/queue - Queue a command (Admin only + 2FA)
router.post('/queue', authenticateToken, checkRole(ADMIN_ROLES), require2FA, async (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    // Security: Restrict /op command to Owners only (neroferno, killuwu)
    // User requested specifically "only for neroferno and killuwu"
    const cmd = command.trim().toLowerCase();
    if (cmd.startsWith('op ') || cmd === 'op') {
        const allowedOpUsers = ['neroferno', 'killuwu'];
        // req.user is guaranteed by authenticateToken
        if (!allowedOpUsers.includes(req.user!.role)) {
             return res.status(403).json({ error: 'Permission Denied: Only Owners can use /op' });
        }
    }

    const result = await commandService.queueCommand(command);
    if (result.success) {
        res.json({ message: 'Command queued successfully', id: result.id });
    } else {
        res.status(500).json({ error: 'Failed to queue command' });
    }
});

export default router;
