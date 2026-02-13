import * as forumService from '../services/forumService.js';
export const getThreads = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const data = await forumService.getThreads(parseInt(categoryId));
        res.json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('does not exist'))
            return res.json([]);
        res.status(500).json({ error: message });
    }
};
export const getUserThreads = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await forumService.getUserThreads(userId);
        res.json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const getThread = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await forumService.getThread(id);
        res.json(data);
    }
    catch {
        res.status(404).json({ error: "Thread not found" });
    }
};
/**
 * Aggregated Endpoint: Thread + Poll + Posts
 * Optimizes initial load by fetching everything in parallel
 */
export const getThreadFull = async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch Thread (includes Poll) and Posts in parallel
        // forumService.getThread handles both numeric ID and slug strings
        const [thread, posts] = await Promise.all([
            forumService.getThread(id),
            forumService.getPosts(id)
        ]);
        res.json({ ...thread, posts });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(404).json({ error: message });
    }
};
export const createThread = async (req, res) => {
    try {
        const result = await forumService.createThread(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const getPosts = async (req, res) => {
    try {
        const data = await forumService.getPosts(req.params.id);
        res.json(data);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
export const createPost = async (req, res) => {
    try {
        const result = await forumService.createPost({ ...req.body, thread_id: req.params.id });
        res.status(201).json(result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
export const getStats = async (req, res) => {
    try {
        const data = await forumService.getCategoryStats();
        res.json(data);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
export const updateThread = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await forumService.updateThread(id, req.body);
        res.json(result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
export const deleteThread = async (req, res) => {
    try {
        const { id } = req.params;
        await forumService.deleteThread(id);
        res.json({ message: "Thread deleted" });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await forumService.updatePost(parseInt(id), req.body);
        res.json(result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await forumService.deletePost(parseInt(id));
        res.json({ message: "Post deleted" });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message });
    }
};
