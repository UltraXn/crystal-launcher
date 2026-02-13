import db from '../config/database.js';
import { updateUserMetadata } from '../services/userService.js';
export const linkAccount = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        if (!code) {
            return res.status(400).json({ message: 'Falta el código' });
        }
        // 1. Verify Code in MySQL
        const [rows] = await db.query('SELECT * FROM verification_codes WHERE code = ?', [code]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Código inválido o expirado' });
        }
        const verification = rows[0];
        // 2. Update Supabase User Profile
        await updateUserMetadata(userId, {
            discord: {
                id: verification.discord_id,
                username: verification.discord_username
            },
            social_discord: verification.discord_username // Legacy support
        });
        // 3. Delete Code
        await db.query('DELETE FROM verification_codes WHERE code = ?', [code]);
        res.json({ success: true, message: 'Cuenta vinculada exitosamente', discord: verification.discord_username });
    }
    catch (error) {
        console.error('Link Error:', error);
        res.status(500).json({ message: 'Error al vincular cuenta' });
    }
};
