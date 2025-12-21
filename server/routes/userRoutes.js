const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes (Should be protected with Admin Middleware in production)
router.get('/', userController.getAllUsers);
router.get('/profile/:username', userController.getPublicProfile);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/metadata', userController.updateUserMetadata);

module.exports = router;
