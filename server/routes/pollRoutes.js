const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

router.get('/', pollController.getPolls);
router.get('/active', pollController.getActivePoll);
router.post('/vote', pollController.vote);
router.post('/create', pollController.create);
router.post('/close/:id', pollController.close);

module.exports = router;
