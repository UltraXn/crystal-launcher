import express from 'express';
import { translateText } from '../services/translationService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/', authenticateToken, async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }
    try {
        const translated = await translateText(text, targetLang || 'en');
        res.json({ success: true, translatedText: translated });
    }
    catch (error) {
        console.error("Translation route error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});
export default router;
