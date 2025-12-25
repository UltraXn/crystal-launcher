import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth error:', error);
            return res.sendStatus(403);
        }

        // Map Supabase user to req.user for consistency
        req.user = {
            id: user.id,
            email: user.email,
            username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
            role: user.user_metadata?.role || 'user'
        };

        next();
    } catch (err) {
        console.error('Unexpected auth error:', err);
        res.sendStatus(403);
    }
};
