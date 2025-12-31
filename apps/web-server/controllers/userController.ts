import * as userService from '../services/userService.js';
import * as logService from '../services/logService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const users = await userService.getAllUsers(search as string);
        return sendSuccess(res, users, 'Users listed successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role) return sendError(res, 'Role is required', 'MISSING_FIELD', 400);

        const updatedUser = await userService.updateUserRole(id, role);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_ROLE',
            details: `Updated user ${id} role to ${role}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, updatedUser, 'User role updated');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const updateUserMetadata = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { metadata } = req.body;
        
        if (!metadata) return sendError(res, 'Metadata object is required', 'MISSING_FIELD', 400);

        const updatedUser = await userService.updateUserMetadata(id, metadata);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_METADATA',
            details: `Updated user ${id} metadata: ${JSON.stringify(metadata)}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, updatedUser, 'User metadata updated');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const profile = await userService.getPublicProfile(username);
        if (!profile) return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
        return sendSuccess(res, profile);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
export const getStaffUsers = async (req: Request, res: Response) => {
    try {
        const staff = await userService.getStaffUsers();
        return sendSuccess(res, staff, 'Staff users fetched successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const giveKarma = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const voterId = (req as Request & { user: { id: string } }).user.id; // From authenticateToken middleware

        if (id === voterId) {
            return sendError(res, 'No puedes darte karma a ti mismo', 'SELF_VOTE', 400);
        }

        const newReputation = await userService.giveKarma(id, voterId);
        return sendSuccess(res, { newReputation }, 'Karma dado exitosamente');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
