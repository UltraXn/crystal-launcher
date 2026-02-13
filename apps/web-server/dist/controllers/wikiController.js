import * as wikiService from '../services/wikiService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
export const getArticles = async (req, res) => {
    try {
        const { category } = req.query;
        const articles = await wikiService.getAllArticles(category);
        return sendSuccess(res, articles);
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error fetching wiki articles');
    }
};
export const getArticle = async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await wikiService.getArticleBySlug(slug);
        if (!article)
            return sendError(res, 'Article not found', 'NOT_FOUND', 404);
        return sendSuccess(res, article);
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error fetching wiki article');
    }
};
export const createWikiArticle = async (req, res) => {
    try {
        const user = req.user;
        const articleData = { ...req.body, author_id: user?.id };
        const article = await wikiService.createArticle(articleData);
        return sendSuccess(res, article, 'Article created');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error creating wiki article');
    }
};
export const updateWikiArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await wikiService.updateArticle(parseInt(id), req.body);
        return sendSuccess(res, article, 'Article updated');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error updating wiki article');
    }
};
export const deleteWikiArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await wikiService.deleteArticle(parseInt(id));
        return sendSuccess(res, null, 'Article deleted');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error deleting wiki article');
    }
};
