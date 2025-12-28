import * as ticketService from '../services/ticketService.js';
import * as logService from '../services/logService.js';
import * as minecraftService from '../services/minecraftService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username?: string;
        role: string;
        email?: string;
        minecraft_uuid?: string;
    };
}

const getLogUsername = (req: Request) => {
    const user = (req as AuthenticatedRequest).user;
    console.log('DEBUG: getLogUsername - req.user:', user);
    return user?.username || user?.email || 'Unknown';
};

// Admin: Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await ticketService.getAllTickets();
        return sendSuccess(res, tickets);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// User: Create ticket
export const createTicket = async (req: Request, res: Response) => {
    try {
        const { user_id, subject, description, priority } = req.body;

        if (!user_id || !subject) {
            return sendError(res, 'Missing user_id or subject', 'MISSING_FIELD', 400);
        }

        const ticket = await ticketService.createTicket(user_id, { subject, description, priority });
        
        // Log
        logService.createLog({
            username: getLogUsername(req),
            action: 'CREATE_TICKET',
            details: `Ticket #${ticket.id}: ${subject}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, ticket, 'Ticket created successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Admin: Update Status
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await ticketService.updateTicketStatus(parseInt(id), status);
        
        const username = getLogUsername(req);
        
        logService.createLog({
            username: username,
            action: 'UPDATE_STATUS',
            details: `Ticket #${id} status changed to ${status}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, ticket, 'Ticket status updated');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Get Stats
export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await ticketService.getTicketStats();
        return sendSuccess(res, stats);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Get Messages
export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const messages = await ticketService.getTicketMessages(parseInt(id));
        return sendSuccess(res, messages);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Add Message
export const addMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { user_id, message, is_staff } = req.body;

        if (!message) return sendError(res, "Message is required", 'MISSING_FIELD', 400);

        const newMessage = await ticketService.addTicketMessage(parseInt(id), user_id, message, is_staff);
        return sendSuccess(res, newMessage, 'Message added');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        const { username, reason } = req.body;
        if (!username) return sendError(res, 'Username required', 'MISSING_FIELD', 400);

        const cmd = `ban ${username} ${reason || 'Banned via Web Panel'}`;
        const result = await minecraftService.sendCommand(cmd);

        if (result.success) {
            logService.createLog({
                username: getLogUsername(req),
                action: 'BAN_USER',
                details: `Banned user ${username}. Reason: ${reason || 'N/A'}`,
                source: 'web'
            }).catch(console.error);

            return sendSuccess(res, { command: cmd }, `User ${username} banned successfully`);
        } else {
            return sendError(res, result.error || 'RCON Error', 'RCON_FAILED');
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ticketService.deleteTicket(parseInt(id));

        logService.createLog({
            username: getLogUsername(req),
            action: 'DELETE_TICKET',
            details: `Deleted ticket #${id}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, null, "Ticket deleted successfully");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
