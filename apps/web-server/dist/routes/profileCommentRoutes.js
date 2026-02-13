import express from 'express';
import * as commentController from '../controllers/profileCommentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
// Public: Get comments for a profile
router.get('/:profileId', commentController.getComments);
// Protected: Post a comment
router.post('/:profileId', authenticateToken, commentController.postComment);
// Protected: Delete a comment (RLS handles ownership)
router.delete('/:id', authenticateToken, commentController.removeComment);
export default router;
