const minecraftService = require('../services/minecraftService');
const skinService = require('../services/skinService');

const getStatus = async (req, res) => {
    try {
        const host = process.env.MC_SERVER_HOST || 'localhost';
        const port = parseInt(process.env.MC_SERVER_PORT || '25565');

        const status = await minecraftService.getServerStatus(host, port);

        res.json(status);
    } catch (error) {
        res.status(500).json({
            online: false,
            error: 'Internal server error fetching status'
        });
    }
};

const getSkin = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const skinData = await skinService.getSkinUrl(username);
        // Redirect to the skin URL so the frontend can just use <img src="/api/minecraft/skin/user" />?
        // OR return JSON?
        // SkinViewer expects a URL to a texture image.
        // If I redirect, I can just pass the API URL to SkinViewer.
        // However, SkinViewer (skinview3d) might need CORS headers on the image.
        // Mojang/Minotar images usually have CORS.
        // If I redirect, the browser fetches the target.
        // Let's return JSON to be safe and flexible.
        res.json(skinData);
    } catch (error) {
        console.error("Error fetching skin:", error);
        // Fallback to minotar direct
        res.json({ url: `https://minotar.net/skin/${req.params.username}`, source: 'fallback' });
    }
};

module.exports = {
    getStatus,
    getSkin
};
