const pollService = require('../services/pollService');

const getActivePoll = async (req, res) => {
    try {
        const poll = await pollService.getActivePoll();
        if(!poll) return res.status(404).json({ message: "No active poll" });
        res.json(poll);
    } catch (error) {
        // Handle "relation does not exist" gracefully as usual
        if (error.message && error.message.includes('does not exist')) {
            return res.status(200).json(null); // Return null so frontend shows nothing
        }
        res.status(500).json({ error: error.message });
    }
};

const vote = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;
        // Simple logic: pass to service
        const result = await pollService.votePoll(pollId, optionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await pollService.createPoll(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const close = async (req, res) => {
    try {
        await pollService.closePoll(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPolls = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await pollService.getPolls({ page, limit });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getActivePoll, vote, create, close, getPolls };
