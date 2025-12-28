import express from 'express';
import * as wikiController from '../controllers/wikiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// Public routes
router.get('/', wikiController.getArticles);
router.get('/:slug', wikiController.getArticle);

// Admin routes
router.post('/', authenticateToken, checkRole(ADMIN_ROLES), wikiController.createWikiArticle);
router.put('/:id', authenticateToken, checkRole(ADMIN_ROLES), wikiController.updateWikiArticle);
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), wikiController.deleteWikiArticle);

export default router;
