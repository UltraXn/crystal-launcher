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

const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Database Config
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase;
if (supabaseUrl && supabaseKey) supabase = createClient(supabaseUrl, supabaseKey);

const verifyLinkCode = async (req, res) => {
    let connection;
    try {
        const { code, userId } = req.body;
        if (!code || !userId) return res.status(400).json({ error: 'Code and UserId required' });

        if (!supabase) return res.status(503).json({ error: 'Server configuration error (Supabase)' });

        // 1. Verify Code in MySQL
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM web_verifications WHERE code = ?',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired code.' });
        }

        const verification = rows[0];
        
        // Check Expiry
        if (Date.now() > Number(verification.expires_at)) {
            await connection.execute('DELETE FROM web_verifications WHERE code = ?', [code]);
            return res.status(400).json({ error: 'Code expired. Please generate a new one.' });
        }

        // 2. Code is Valid! Link Account in Supabase
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { minecraft_uuid: verification.uuid, username: verification.player_name } }
        );

        if (updateError) throw updateError;

        // 3. Cleanup
        await connection.execute('DELETE FROM web_verifications WHERE uuid = ?', [verification.uuid]);
        
        res.json({ success: true, username: verification.player_name, uuid: verification.uuid });

    } catch (error) {
        console.error('Link Verification Error:', error);
        res.status(500).json({ error: 'Verification failed: ' + error.message });
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = {
    getStatus,
    getSkin,
    verifyLinkCode
};
