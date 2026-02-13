import * as pollService from '../services/pollService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
export const getActivePoll = async (req, res) => {
    try {
        const poll = await pollService.getActivePoll();
        return sendSuccess(res, poll); // Can be null, that's fine
    }
    catch (error) {
        // Handle "relation does not exist" gracefully as usual
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('does not exist')) {
            return sendSuccess(res, null, 'Tables missing, no poll returned');
        }
        return sendError(res, message);
    }
};
export const vote = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;
        const result = await pollService.votePoll(pollId, optionId);
        return sendSuccess(res, result, 'Vote recorded');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
export const create = async (req, res) => {
    try {
        const result = await pollService.createPoll(req.body);
        return sendSuccess(res, result, 'Poll created successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
export const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pollService.updatePoll(id, req.body);
        return sendSuccess(res, result, 'Poll updated successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
export const close = async (req, res) => {
    try {
        await pollService.closePoll(parseInt(req.params.id));
        return sendSuccess(res, null, 'Poll closed successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
export const deletePoll = async (req, res) => {
    try {
        await pollService.deletePoll(parseInt(req.params.id));
        return sendSuccess(res, null, 'Poll deleted successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
export const getPolls = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await pollService.getPolls({ page, limit });
        return sendSuccess(res, result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
