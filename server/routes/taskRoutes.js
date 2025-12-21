const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /api/staff/tasks
router.get('/', taskController.getTasks);

// POST /api/staff/tasks
router.post('/', taskController.createTask);

// PUT /api/staff/tasks/:id
router.put('/:id', taskController.updateTask);

// DELETE /api/staff/tasks/:id
router.delete('/:id', taskController.deleteTask);

module.exports = router;
