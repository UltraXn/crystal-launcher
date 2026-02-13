import * as coreProtectService from '../services/coreProtectService.js';
export const getCommandLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const logs = await coreProtectService.getCommandLogs({ page, limit, search });
        res.json(logs);
    }
    catch (error) {
        console.error('CoreProtect Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'Failed to fetch command logs', details: message });
    }
};
