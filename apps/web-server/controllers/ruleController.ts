import { Request, Response } from 'express';
import * as ruleService from '../services/ruleService.js';
import * as logService from '../services/logService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getRules = async (req: Request, res: Response) => {
    try {
        const rules = await ruleService.getAllRules();
        // Agrupar por categorías si el frontend lo prefiere plano o no.
        // Lo mandamos plano y que el front decida cómo renderizar.
        return sendSuccess(res, rules);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Si la tabla no existe, devolvemos array vacío para no romper el front
        if (message.includes('relation "public.server_rules" does not exist')) {
            return sendSuccess(res, [], 'Rules table not created yet');
        }
        return sendError(res, message);
    }
};

export const createRule = async (req: Request, res: Response) => {
    try {
        const { category, title, content, sort_order, user_id, username } = req.body;

        if (!category || !title || !content) {
            return sendError(res, 'Missing required fields: category, title, content', 'MISSING_FIELDS', 400);
        }

        const newRule = await ruleService.createRule({
            category,
            title,
            content,
            sort_order: sort_order || 0
        });

        // Audit Log
        logService.createLog({
            user_id: user_id || null, // Del auth middleware idealmente
            username: username || 'Admin',
            action: 'CREATE_RULE',
            details: `Created rule: ${title} (${category})`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, newRule, 'Rule created successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const updateRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { user_id, username } = req.body; // Extraer info de auditoría

        const updatedRule = await ruleService.updateRule(parseInt(id), {
            category: updates.category,
            title: updates.title,
            content: updates.content,
            sort_order: updates.sort_order
        });

        // Audit Log
        logService.createLog({
            user_id: user_id || null,
            username: username || 'Admin',
            action: 'UPDATE_RULE',
            details: `Updated rule #${id}: ${updatedRule.title}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, updatedRule, 'Rule updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const deleteRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { user_id, username } = req.body; // O query params para delete suele ser mejor, pero body funciona

        await ruleService.deleteRule(parseInt(id));

        // Audit Log
        logService.createLog({
            user_id: user_id || null,
            username: username || 'Admin',
            action: 'DELETE_RULE',
            details: `Deleted rule #${id}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, null, 'Rule deleted successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
