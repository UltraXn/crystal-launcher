import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// All ticket routes require authentication
router.use(authenticateToken);

import { validate } from '../middleware/validateResource.js';
import { createTicketSchema, addTicketMessageSchema, updateTicketStatusSchema } from '../schemas/ticketSchemas.js';

import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';

// Ticket Routes
router.get('/', checkRole(STAFF_ROLES), ticketController.getAllTickets);
router.post('/', sensitiveActionLimiter, validate(createTicketSchema), ticketController.createTicket);
router.get('/stats', checkRole(STAFF_ROLES), ticketController.getStats);

// Ticket Operations
router.patch('/:id/status', validate(updateTicketStatusSchema), ticketController.updateStatus); // Ownership check in controller
router.delete('/:id', checkRole(ADMIN_ROLES), ticketController.deleteTicket);

// Messages
router.get('/:id/messages', ticketController.getMessages); // Ownership check in controller
router.post('/:id/messages', sensitiveActionLimiter, validate(addTicketMessageSchema), ticketController.addMessage);

// Ban User (Admin Action)
router.post('/ban', checkRole(ADMIN_ROLES), ticketController.banUser);

export default router;
