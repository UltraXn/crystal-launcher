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
    } catch (error) {
        console.error("[PlayerStats] Error:", error);
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, "Internal Server Error", "INTERNAL_ERROR", 500, message);
    }
};
