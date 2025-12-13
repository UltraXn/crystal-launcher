const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
// Define routes
router.get('/stats', ticketController.getStats);
router.post('/ban', ticketController.banUser); // Generic ban route

router.get('/:id/messages', ticketController.getMessages);
router.post('/:id/messages', ticketController.addMessage);

router.get('/', ticketController.getAllTickets);
router.post('/', ticketController.createTicket);
router.patch('/:id/status', ticketController.updateStatus);

router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
