import * as logService from '../services/logService.js';
import { Request, Response } from 'express';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50', source = 'web', search = '' } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        if (source === 'game') {
            const data = await logService.getGameLogs({ limit: parseInt(limit as string), offset, search: search as string });
            return res.json(data);
        }

        const data = await logService.getLogs({ limit: parseInt(limit as string), offset, source: source as string, search: search as string });
        res.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
};

export const createLog = async (req: Request, res: Response) => {
    try {
        const logData = req.body;
        const log = await logService.createLog(logData);
        res.status(201).json(log);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
};

export const reportSecurityAlert = async (req: Request, res: Response) => {
    try {
        const { email, details } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Create a SECURITY log
        await logService.createLog({
            username: 'SYSTEM_ALERT',
            action: 'LOGIN_FAIL',
            details: `Failed login attempt for: ${email}. IP: ${ip}. ${details || ''}`,
            source: 'security'
        });

        // Always return success to not leak info to attacker
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Security Report Error:", error);
        res.status(200).json({ success: true }); // Silent fail
    }
};
