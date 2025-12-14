const forumService = require('../services/forumService');

const getThreads = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const data = await forumService.getThreads(categoryId);
        res.json(data);
    } catch (error) {
        if (error.message && error.message.includes('does not exist')) return res.json([]);
        res.status(500).json({ error: error.message });
    }
};

const getUserThreads = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await forumService.getUserThreads(userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getThread = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await forumService.getThread(id);
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: "Thread not found" });
    }
};

const createThread = async (req, res) => {
    try {
        const result = await forumService.createThread(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPosts = async (req, res) => {
    try {
        const data = await forumService.getPosts(req.params.id);
        res.json(data);
    } catch (e) { res.status(500).json({error:e.message}); }
};

const createPost = async (req, res) => {
    try {
        const result = await forumService.createPost({...req.body, thread_id: req.params.id});
        res.status(201).json(result);
    } catch (e) { res.status(500).json({error:e.message}); }
};

const getStats = async (req, res) => {
    try {
        const data = await forumService.getCategoryStats();
        res.json(data);
    } catch (e) { res.status(500).json({error:e.message}); }
};

module.exports = { getThreads, getUserThreads, getThread, createThread, getPosts, createPost, getStats };
