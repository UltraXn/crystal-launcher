const express = require('express');
const { handleKofiWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/kofi', handleKofiWebhook);

module.exports = router;
