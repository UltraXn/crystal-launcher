const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// GET /api/staff/notes
router.get('/', noteController.getNotes);

// POST /api/staff/notes
router.post('/', noteController.createNote);

// DELETE /api/staff/notes/:id
router.delete('/:id', noteController.deleteNote);

module.exports = router;
