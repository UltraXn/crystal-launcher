import * as donationService from '../services/donationService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await donationService.getMonthlyStats();
        return sendSuccess(res, stats);
    } catch (error) {
        // If table doesn't exist, return 0s instead of crashing
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('relation "public.donations" does not exist')) {
             return sendSuccess(res, { currentMonth: "0.00", previousMonth: "0.00", percentChange: "0.0" }, 'Default stats returned (Table missing)');
        }
        return sendError(res, message);
    }
};

export const getDonations = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string) || '';
        
        const result = await donationService.getDonations({ page, limit, search });
        return sendSuccess(res, result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const createDonation = async (req: Request, res: Response) => {
    try {
        const result = await donationService.createDonation(req.body);
        return sendSuccess(res, result, 'Donation created successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const updateDonation = async (req: Request, res: Response) => {
    try {
        const result = await donationService.updateDonation(parseInt(req.params.id), req.body);
        return sendSuccess(res, result, 'Donation updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const deleteDonation = async (req: Request, res: Response) => {
    try {
        await donationService.deleteDonation(parseInt(req.params.id));
        return sendSuccess(res, null, 'Donation deleted successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
