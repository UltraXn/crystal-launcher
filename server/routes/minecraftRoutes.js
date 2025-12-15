const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');

// GET /api/minecraft/status
router.get('/status', minecraftController.getStatus);
router.get('/skin/:username', minecraftController.getSkin);

// POST /api/minecraft/link
router.post('/link', minecraftController.verifyLinkCode);

module.exports = router;
