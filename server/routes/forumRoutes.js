const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

router.get('/stats', forumController.getStats);
router.get('/category/:categoryId', forumController.getThreads);
router.get('/thread/:id', forumController.getThread);
router.post('/threads', forumController.createThread);
router.get('/thread/:id/posts', forumController.getPosts);
router.post('/thread/:id/posts', forumController.createPost);

module.exports = router;
