const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/my-registrations', eventController.getUserRegistrations);
router.get('/:id/registrations', eventController.getEventRegistrations);
router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent); // Should add auth middleware eventually
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/register', eventController.registerForEvent);

module.exports = router;
