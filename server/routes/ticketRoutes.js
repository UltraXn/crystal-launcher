const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Ticket Routes
router.get('/', ticketController.getAllTickets);
router.post('/', ticketController.createTicket);
router.get('/stats', ticketController.getStats);

// Ticket Operations
router.patch('/:id/status', ticketController.updateStatus);
router.delete('/:id', ticketController.deleteTicket);

// Messages
router.get('/:id/messages', ticketController.getMessages);
router.post('/:id/messages', ticketController.addMessage);

// Ban User (Admin Action)
router.post('/ban', ticketController.banUser);

module.exports = router;
