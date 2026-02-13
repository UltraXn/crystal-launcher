import { Request, Response } from 'express';
import { getNotionTasks, createNotionPage } from '../services/notionService.js';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await getNotionTasks();
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Notion tasks' });
    }
};

export const syncTask = async (req: Request, res: Response) => {
    try {
        const { title, status } = req.body;
        if (!title) return res.status(400).json({ error: 'Title required' });

        const page = await createNotionPage({ title, status });
        res.json(page);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to sync to Notion' });
    }
};
