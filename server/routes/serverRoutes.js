const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Pterodactyl Config
const PTERO_URL = "https://panel.holyhosting.net"; // Your panel URL (inferred from host IP but usually domain)
// Actually, let's assume standard Pterodactyl API URL structure based on host or provided var?
// Environment has PTERODACTYL_SERVER_ID and API_KEY. Need to know the PANEL URL.
// User didn't provide PANEL URL in .env, but usually it's passed or known.
// Let's look at existing code or ask. Assuming https://panel.holyhosting.net based on "HolyHosting".
// Wait, looking at .env content viewed earlier:
// PTERODACTYL_API_KEY=ptlc_...
// MC_SERVER_HOST=147...
// PTERODACTYL_SERVER_ID=5a931111
// We need the Panel URL. Usually client knows it. I'll make it an env var or guess.
// Let's use a placeholder and user can update or I will try to infer.

const PANEL_URL = process.env.PTERODACTYL_URL || "https://panel.holy.gg"; 
const API_KEY = process.env.PTERODACTYL_API_KEY;
const SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

const mysql = require('mysql2/promise');
const dbConfig = { 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME 
};

// Route: Get Server Resources (RAM, CPU, State) + PLAN GLOBAL STATS
router.get('/resources', async (req, res) => {
    let connection = null;
    try {
        if (!API_KEY || !SERVER_ID) {
            return res.status(500).json({ error: "Pterodactyl credentials missing" });
        }

        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        // 1. Fetch Pterodactyl Stats
        const [resStats, resDetails] = await Promise.all([
            fetch(`${PANEL_URL}/api/client/servers/${SERVER_ID}/resources`, { method: 'GET', headers }),
            fetch(`${PANEL_URL}/api/client/servers/${SERVER_ID}`, { method: 'GET', headers })
        ]);

        let pteroData = {
            status: "offline",
            memory: { current: 0, limit: 0 },
            cpu: 0,
            disk: 0
        };

        if (resStats.ok) {
            const dataStats = await resStats.json();
            const dataDetails = resDetails.ok ? await resDetails.json() : null;
            const attr = dataStats.attributes;
            const limits = dataDetails?.attributes?.limits || {};

            const cpuAbsolute = attr.resources.cpu_absolute;
            const cpuLimit = limits.cpu || 100; 
            const cpuNormalized = cpuLimit > 0 ? (cpuAbsolute / cpuLimit) * 100 : cpuAbsolute;

            pteroData = {
                status: attr.current_state,
                memory: {
                    current: Math.round(attr.resources.memory_bytes / 1024 / 1024),
                    limit: Math.round(limits.memory || 0)
                },
                cpu: parseFloat(cpuNormalized.toFixed(1)),
                disk: Math.round(attr.resources.disk_bytes / 1024 / 1024)
            };
        }

        // 2. Fetch Plan Global Stats (MySQL)
        let planStats = {
            online: 0,
            total_players: 0,
            new_players: 0,
            total_playtime_hours: 0
        };

        try {
            connection = await mysql.createConnection(dbConfig);
            
            // 24h ago in ms
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            const [rows] = await connection.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM plan_sessions WHERE session_end IS NULL) as online_count,
                    (SELECT COUNT(*) FROM plan_users) as total_users,
                    (SELECT COUNT(*) FROM plan_users WHERE registered >= ?) as new_users,
                    (SELECT SUM(session_end - session_start) FROM plan_sessions WHERE session_end IS NOT NULL) as total_playtime_ms
                FROM DUAL
            `, [oneDayAgo]);
            
            if (rows.length > 0) {
                const r = rows[0];
                planStats.online = r.online_count || 0;
                planStats.total_players = r.total_users || 0;
                planStats.new_players = r.new_users || 0;
                planStats.total_playtime_hours = Math.floor((Number(r.total_playtime_ms) || 0) / 1000 / 60 / 60);
            }
            
        } catch (dbErr) {
            console.error("Plan DB Error in Resource Route:", dbErr.message);
        } finally {
            if (connection) await connection.end();
        }

        // Combine and Send
        res.json({
            ...pteroData,
            ...planStats
        });

    } catch (error) {
        console.error("Server Status Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
        if (connection) await connection.end();
    }
});

module.exports = router;
