import { Request, Response } from 'express';
import * as gachaService from '../services/gachaService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ADMIN_ROLES } from '../utils/roleUtils.js';

export const roll = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return sendError(res, "Missing userId", "BAD_REQUEST", 400);
        }

        // Security Check: User can only roll for themselves
        if (req.user?.id !== userId) {
            return sendError(res, "Unauthorized: Identity mismatch", "UNAUTHORIZED", 403);
        }

        const reward = await gachaService.rollGacha(userId);
        return sendSuccess(res, reward, 'Gacha roll successful');

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        if (message === "COOLDOWN_ACTIVE") {
             return sendError(res, "You can only roll once every 24 hours!", "COOLDOWN", 429);
        }
        return sendError(res, message || "Gacha failed", "INTERNAL_ERROR", 500);
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Security Check: User can only see their own history unless they are admin
        const isAdmin = ADMIN_ROLES.includes(req.user?.role || '');
        if (req.user?.id !== userId && !isAdmin) {
             return sendError(res, "Unauthorized: You can only view your own history", "UNAUTHORIZED", 403);
        }

        const history = await gachaService.getHistory(userId);
        return sendSuccess(res, history);
    } catch (error: unknown) {
        return sendError(res, error instanceof Error ? error.message : String(error));
    }
};
