import * as commentService from '../services/profileCommentService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
export const getComments = async (req, res) => {
    try {
        const { profileId } = req.params;
        const comments = await commentService.getCommentsByProfile(profileId);
        return sendSuccess(res, comments);
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error fetching comments');
    }
};
export const postComment = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { content } = req.body;
        const user = req.user;
        if (!user)
            return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        if (!content)
            return sendError(res, 'Content is required', 'MISSING_FIELDS', 400);
        const comment = await commentService.createComment(profileId, user.id, content);
        return sendSuccess(res, comment, 'Comment posted');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error posting comment');
    }
};
export const removeComment = async (req, res) => {
    try {
        const { id } = req.params;
        await commentService.deleteComment(parseInt(id));
        return sendSuccess(res, null, 'Comment deleted');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error deleting comment');
    }
};
