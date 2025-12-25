import { Request, Response } from 'express';
import * as gachaService from '../services/gachaService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const roll = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return sendError(res, "Missing userId", "BAD_REQUEST", 400);
        }

        const reward = await gachaService.rollGacha(userId);
        return sendSuccess(res, reward, 'Gacha roll successful');

    } catch (error: any) {
        if (error.message === "COOLDOWN_ACTIVE") {
             return sendError(res, "You can only roll once every 24 hours!", "COOLDOWN", 429);
        }
        return sendError(res, error.message || "Gacha failed", "INTERNAL_ERROR", 500);
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const history = await gachaService.getHistory(userId);
        return sendSuccess(res, history);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};
