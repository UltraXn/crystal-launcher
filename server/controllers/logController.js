const logService = require('../services/logService');

const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, source = 'web', search = '' } = req.query;
        const offset = (page - 1) * limit;

        if (source === 'game') {
            const data = await logService.getGameLogs({ limit, offset, search });
            return res.json(data);
        }

        const data = await logService.getLogs({ limit: parseInt(limit), offset: parseInt(offset), source, search });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createLog = async (req, res) => {
    try {
        const logData = req.body;
        const log = await logService.createLog(logData);
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getLogs,
    createLog
};
