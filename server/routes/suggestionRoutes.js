const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');

router.get('/', suggestionController.getSuggestions);
router.post('/', suggestionController.createSuggestion);
router.delete('/:id', suggestionController.deleteSuggestion);

module.exports = router;
