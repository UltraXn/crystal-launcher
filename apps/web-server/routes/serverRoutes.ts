import util from 'minecraft-server-util';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import mysql from 'mysql2/promise';
import * as userService from '../services/userService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// Pterodactyl Config
// Environment has PTERODACTYL_SERVER_ID and API_KEY. Need to know the PANEL URL.
// Actually, let's assume standard Pterodactyl API URL structure based on host or provided var?
// User didn't provide PANEL URL in .env, but usually it's passed or known.
// Let's look at existing code or ask. Assuming https://panel.holyhosting.net based on "HolyHosting".
// Wait, looking at .env content viewed earlier:
// PTERODACTYL_API_KEY=ptlc_...
// MC_SERVER_HOST=147...
// PTERODACTYL_SERVER_ID=5a931111
// We need the Panel URL. Usually client knows it. I'll make it an env var or guess.
// Let's use a placeholder and user can update or I will try to infer.

const PANEL_URL = process.env.PTERODACTYL_HOST || "https://panel.holy.gg"; 
const API_KEY = process.env.PTERODACTYL_API_KEY;
const SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

const dbConfig = { 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME 
};

interface PteroResources {
    attributes: {
        current_state: string;
        resources: {
            memory_bytes: number;
            cpu_absolute: number;
            disk_bytes: number;
        };
    };
}

interface PteroLimits {
    memory: number;
    cpu: number;
    disk: number;
}

interface PteroServerDetails {
    attributes: {
        limits: PteroLimits;
    };
}

// Route: Get Server Resources (RAM, CPU, State) + PLAN GLOBAL STATS
router.get('/resources', authenticateToken, checkRole(STAFF_ROLES), async (req: Request, res: Response) => {
    let connection = null;
    try {
        if (!API_KEY || !SERVER_ID) {
            return res.status(500).json({ error: "Pterodactyl credentials missing" });
        }

        const headers: Record<string, string> = {
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
            const dataStats = await resStats.json() as PteroResources;
            const dataDetails = resDetails.ok ? await resDetails.json() as PteroServerDetails : null;
            const attr = dataStats.attributes;
            const limits = dataDetails?.attributes?.limits || { cpu: 100, memory: 0, disk: 0 };

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
        const planStats = {
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
            
            if (Array.isArray(rows) && rows.length > 0) {
                const r = rows[0] as { 
                    online_count: number; 
                    total_users: number; 
                    new_users: number; 
                    total_playtime_ms: number | string 
                };
                planStats.online = r.online_count || 0;
                planStats.total_players = r.total_users || 0;
                planStats.new_players = r.new_users || 0;
                planStats.total_playtime_hours = Math.floor((Number(r.total_playtime_ms) || 0) / 1000 / 60 / 60);
            }
            
        } catch (dbErr: unknown) {
            const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
            console.error("Plan DB Error in Resource Route:", message);
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

// Route: Get Online Staff
// (util imported at top)

// Route: Get Online Staff (Real-time via Query Protocol - No RCON)
router.get('/staff', async (req: Request, res: Response) => {
    let connection = null;
    
    try {
        // 1. Fetch Online Players via Query Protocol (Lighter than RCON)
        const host = process.env.MC_SERVER_HOST || 'localhost';
        const port = parseInt(process.env.MC_SERVER_PORT as string) || 25565;

        // Use util.status (Query) to get player list
        // Note: 'enableSRV: true' is good for domain resolution
        // Note: Query output depends on server.properties 'enable-query=true' usually, or standard handshake logic.
        // util.status usually gets sample list. If full list is needed, util.queryFull is better but requires enable-query=true.
        // Let's try util.status first as it is used in live status.
        
        let onlineUsernames: string[] = [];
        // Use a Map to store original casing if needed, but Set for uniqueness
        const uniqueUsers = new Set<string>();
        
        // 1. Try Query Protocol
        try {
            const result = await util.status(host, port, { timeout: 4000, enableSRV: true }); // Increased timeout
            if (result.players.sample) {
                 result.players.sample.forEach(p => uniqueUsers.add(p.name));
            }
        } catch (statusErr) {
             console.warn("[Staff Route] Query failed:", (statusErr as Error).message);
        }

        // 2. Try Plan DB
        if (!connection) connection = await mysql.createConnection(dbConfig);
        try {
            const [rows] = await connection.execute(`
                SELECT pu.name 
                FROM plan_sessions ps
                JOIN plan_users pu ON ps.user_id = pu.id
                WHERE ps.session_end IS NULL
            }`); 
            (rows as { name: string }[]).forEach((r) => uniqueUsers.add(r.name));
        } catch (dbErr: unknown) {
            console.error("[Staff Route] DB Fetch Error:", dbErr instanceof Error ? dbErr.message : String(dbErr));
        }

        onlineUsernames = Array.from(uniqueUsers);
        console.log("[Staff Route] Detected Online Users:", onlineUsernames);

        if (onlineUsernames.length === 0) {
            if (connection) await connection.end();
            return res.json([]);
        }

        // 2. Resolve Ranks for these players via DB
        if (!connection) connection = await mysql.createConnection(dbConfig);
        
        // 2. Resolve Ranks for these players via REAL permissions table
        if (!connection) connection = await mysql.createConnection(dbConfig);
        
        const placeholders = onlineUsernames.map(() => '?').join(',');
        
        // This query gets the username AND all groups they belong to
        const [rows] = await connection.execute(`
            SELECT lp.username, lp.uuid, up.permission as group_name
            FROM luckperms_players lp
            LEFT JOIN luckperms_user_permissions up ON lp.uuid = up.uuid AND up.permission LIKE 'group.%'
            WHERE lp.username IN (${placeholders})
        `, onlineUsernames);

        // Group rows by username to handle multiple group memberships
        const processedUsers = new Map<string, { username: string, uuid: string, groups: string[] }>();

        (rows as { username: string, uuid: string, group_name: string }[]).forEach((r) => {
            if (!processedUsers.has(r.username)) {
                processedUsers.set(r.username, { 
                    username: r.username, 
                    uuid: r.uuid, 
                    groups: [] 
                });
            }
            if (r.group_name) {
                processedUsers.get(r.username)!.groups.push(r.group_name.replace('group.', ''));
            }
        });

        const finalUsers = Array.from(processedUsers.values());
        console.log("[Staff Check] Users and their groups:", finalUsers.map(u => `${u.username}: [${u.groups.join(', ')}]`));

        if (finalUsers.length === 0) {
             await connection.end();
             return res.json([]);
        }

        // Query Skins from SkinRestorer (sr_players)
        // ... (Same Logic)
        

        // Fetch skins
        const skinMap: Record<string, string> = {};
        const uuids = finalUsers.map(u => u.uuid);
        
        if (uuids.length > 0) {
            try {
                const skinPlaceholders = uuids.map(() => '?').join(',');
                const [skinRows] = await connection.execute(`
                    SELECT uuid, skin_identifier 
                    FROM sr_players 
                    WHERE uuid IN (${skinPlaceholders})
                `, uuids);
                
                (skinRows as { uuid: string, skin_identifier: string }[]).forEach((sr) => {
                    skinMap[sr.uuid] = sr.skin_identifier;
                });
            } catch (err: unknown) {
                console.error("Error fetching skins for staff:", err instanceof Error ? err.message : String(err));
            }
        }

        // Fetch Session Start Times
        const sessionMap: Record<string, number> = {};
        if (uuids.length > 0) {
            try {
                const sessionPlaceholders = uuids.map(() => '?').join(',');
                const [sessionRows] = await connection.execute(`
                    SELECT pu.uuid, MAX(ps.session_start) as session_start 
                    FROM plan_sessions ps 
                    JOIN plan_users pu ON ps.user_id = pu.id 
                    WHERE pu.uuid IN (${sessionPlaceholders})
                    AND ps.session_end IS NULL 
                    GROUP BY pu.uuid
                `, uuids);
                
                (sessionRows as { uuid: string, session_start: number }[]).forEach((s) => {
                    sessionMap[s.uuid] = s.session_start;
                });
            } catch (err: unknown) {
                console.error("Error fetching sessions for staff:", err instanceof Error ? err.message : String(err));
            }
        }

        // Map structure
        const staff = finalUsers.map((user) => {
            // Determine the "best" role from all their groups
            const staffGroups = ['owner', 'fundador', 'neroferno', 'killu', 'killuwu', 'developer', 'admin', 'ꐽ'];
            let role = user.groups.find((g: string) => staffGroups.includes(g.toLowerCase())) || user.groups[0] || 'default';
            let roleImage = null;

            // Normalize Role & Image
            if (user.username === 'UltraXn' && role === 'default') {
                role = 'Founder';
                roleImage = '/ranks/rank-neroferno.png';
            }
            
            if (role === '§f§r') {
               role = 'Founder';
               roleImage = '/ranks/rank-neroferno.png';
            }
            
            // Handle Unicode Developer Group or explicit mapping
            if (role === 'ꐽ') {
                role = 'developer';
                roleImage = '/ranks/developer.png';
            }

            if (role.toLowerCase() === 'neroferno') {
                roleImage = '/ranks/rank-neroferno.png';
            }

            // Determine Avatar
            const skinName = skinMap[user.uuid];
            const avatarUrl = skinName 
                ? `https://mc-heads.net/avatar/${skinName}/100` 
                : `https://mc-heads.net/avatar/${user.uuid}/100`;

            return {
                username: user.username,
                role: role,
                role_image: roleImage,
                uuid: user.uuid,
                avatar: avatarUrl,
                login_time: sessionMap[user.uuid] || Date.now()
            }
        });

        res.json(staff);

    } catch (error) {
        console.error("Staff Online Route Error (" + (error as Error).message + ")");
        res.json([]);
    } finally {
        if (connection) await connection.end();
    }
});

// Route: Get ALL Persistent Staff (from DB, not just online)
router.get('/all-staff', async (req: Request, res: Response) => {
    try {
        const staff = await userService.getStaffUsers();
        res.json({ success: true, data: staff });
    } catch (error: unknown) {
        console.error("All Staff Route Error:", error);
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
});

export default router;
