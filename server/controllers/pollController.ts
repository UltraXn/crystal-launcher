import * as pollService from '../services/pollService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getActivePoll = async (req: Request, res: Response) => {
    try {
        const poll = await pollService.getActivePoll();
        return sendSuccess(res, poll); // Can be null, that's fine
    } catch (error: any) {
        // Handle "relation does not exist" gracefully as usual
        if (error.message && error.message.includes('does not exist')) {
            return sendSuccess(res, null, 'Tables missing, no poll returned');
        }
        return sendError(res, error.message);
    }
};

export const vote = async (req: Request, res: Response) => {
    try {
        const { pollId, optionId } = req.body;
        const result = await pollService.votePoll(pollId, optionId);
        return sendSuccess(res, result, 'Vote recorded');
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const result = await pollService.createPoll(req.body);
        return sendSuccess(res, result, 'Poll created successfully');
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const close = async (req: Request, res: Response) => {
    try {
        await pollService.closePoll(parseInt(req.params.id));
        return sendSuccess(res, null, 'Poll closed successfully');
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const getPolls = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await pollService.getPolls({ page, limit });
        return sendSuccess(res, result);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};
