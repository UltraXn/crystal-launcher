import * as ticketService from '../services/ticketService.js';
import * as logService from '../services/logService.js';
import * as minecraftService from '../services/minecraftService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// Admin: Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await ticketService.getAllTickets();
        return sendSuccess(res, tickets);
    } catch (error: any) {
        return sendError(res, error.message);
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
            username: 'User', // TODO: Fetch real username
            action: 'CREATE_TICKET',
            details: `Ticket #${ticket.id}: ${subject}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, ticket, 'Ticket created successfully');
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

// Admin: Update Status
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await ticketService.updateTicketStatus(parseInt(id), status);
        
        logService.createLog({
            username: 'Staff', // TODO: Get from auth middleware
            action: 'UPDATE_STATUS',
            details: `Ticket #${id} status changed to ${status}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, ticket, 'Ticket status updated');
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

// Get Stats
export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await ticketService.getTicketStats();
        return sendSuccess(res, stats);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

// Get Messages
export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const messages = await ticketService.getTicketMessages(parseInt(id));
        return sendSuccess(res, messages);
    } catch (error: any) {
        return sendError(res, error.message);
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
    } catch (error: any) {
        return sendError(res, error.message);
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
                username: 'Staff',
                action: 'BAN_USER',
                details: `Banned user ${username}. Reason: ${reason || 'N/A'}`,
                source: 'web'
            }).catch(console.error);

            return sendSuccess(res, { command: cmd }, `User ${username} banned successfully`);
        } else {
            return sendError(res, result.error || 'RCON Error', 'RCON_FAILED');
        }
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ticketService.deleteTicket(parseInt(id));

        logService.createLog({
            username: 'Staff',
            action: 'DELETE_TICKET',
            details: `Deleted ticket #${id}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, null, "Ticket deleted successfully");
    } catch (error: any) {
        return sendError(res, error.message);
    }
};
