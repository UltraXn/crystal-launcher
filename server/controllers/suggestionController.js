const suggestionService = require('../services/suggestionService');

const createSuggestion = async (req, res) => {
    try {
        const result = await suggestionService.createSuggestion(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const data = await suggestionService.getSuggestions();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSuggestion = async (req, res) => {
    try {
        await suggestionService.deleteSuggestion(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createSuggestion, getSuggestions, deleteSuggestion };
