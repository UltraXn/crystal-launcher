import * as suggestionService from '../services/suggestionService.js';
export const createSuggestion = async (req, res) => {
    try {
        const result = await suggestionService.createSuggestion(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const getSuggestions = async (req, res) => {
    try {
        const data = await suggestionService.getSuggestions();
        res.json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const deleteSuggestion = async (req, res) => {
    try {
        await suggestionService.deleteSuggestion(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected', 'implemented'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const result = await suggestionService.updateStatus(parseInt(id), status);
        res.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
