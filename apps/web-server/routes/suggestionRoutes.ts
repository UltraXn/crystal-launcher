import express from 'express';
import * as suggestionController from '../controllers/suggestionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

import { validate } from '../middleware/validateResource.js';
import { createSuggestionSchema } from '../schemas/suggestionSchemas.js';

router.get('/', suggestionController.getSuggestions);
router.post('/', authenticateToken, validate(createSuggestionSchema), suggestionController.createSuggestion);
router.patch('/:id/status', authenticateToken, checkRole(STAFF_ROLES), suggestionController.updateStatus);
router.delete('/:id', authenticateToken, checkRole(STAFF_ROLES), suggestionController.deleteSuggestion);

export default router;
