const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController'); // CoreProtect Logs
const logController = require('../controllers/logController'); // Internal Logs

router.get('/', logController.getLogs);
router.post('/', logController.createLog);
router.get('/commands', logsController.getCommandLogs);

module.exports = router;
