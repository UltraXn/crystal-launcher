const pool = require('../config/coreProtectDb');

const getCommandLogs = async ({ page = 1, limit = 50, search = '' }) => {
    try {
        const offset = (page - 1) * limit;
        
        // Query to fetch commands joining with user table
        // CoreProtect tables: co_command (row_id, time, user, message), co_user (row_id, time, user, uuid)
        // We filter by user search if provided
        
        // Filter for specific suspicious commands
        const suspiciousCommands = [
            '/gm ', '/gamemode', 
            '/give', '/item', 
            '/xp', '/experience',
            '/enchant', 
            '/tp ', '/teleport',
            '//', // WorldEdit
            '/fly', '/god', '/heal', '/feed',
            '/op', '/deop',
            '/fill', '/setblock', '/clone',
            '/effect', '/attribute'
        ];

        // Construct dynamic OR clause for LIKE
        const commandFilters = suspiciousCommands.map(() => `cmd.message LIKE ?`).join(' OR ');

        let query = `
            SELECT 
                cmd.time, 
                cmd.message, 
                u.user 
            FROM co_command cmd
            JOIN co_user u ON cmd.user = u.row_id
            WHERE (${commandFilters})
        `;
        
        const params = suspiciousCommands.map(cmd => `${cmd}%`); // Match start of command
        
        if (search) {
            query += ` AND (u.user LIKE ? OR cmd.message LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY cmd.time DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        
        // Count total for pagination
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM co_command cmd
            JOIN co_user u ON cmd.user = u.row_id
            WHERE (${commandFilters})
        `;
        const countParams = suspiciousCommands.map(cmd => `${cmd}%`);

         if (search) {
            countQuery += ` AND (u.user LIKE ? OR cmd.message LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`);
        }
        
        const [countRows] = await pool.query(countQuery, countParams);
        const total = countRows[0].total;

        return {
            data: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching CoreProtect logs:', error);
        throw error;
    }
};

module.exports = {
    getCommandLogs
};
