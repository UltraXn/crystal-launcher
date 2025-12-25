import { Request, Response } from 'express';
import * as playerStatsService from '../services/playerStatsService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getPlayerStats = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const stats = await playerStatsService.getPlayerStats(username);
        
        if (!stats) {
            return sendError(res, 'Player not found', 'PLAYER_NOT_FOUND', 404);
        }

        return sendSuccess(res, stats);
    } catch (error: any) {
        console.error("[PlayerStats] Error:", error);
        return sendError(res, "Internal Server Error", "INTERNAL_ERROR", 500, error.message);
    }
};
