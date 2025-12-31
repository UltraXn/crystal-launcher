import { Response } from 'express';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, meta?: ApiResponse<T>['meta']) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta
    });
};

export const sendError = (res: Response, message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown) => {
    // Sanitize details to avoid circular references (common in Error objects)
    let safeDetails = details;
    if (details instanceof Error) {
        safeDetails = {
            message: details.message,
            stack: process.env.NODE_ENV === 'development' ? details.stack : undefined
        };
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            details: safeDetails
        }
    });
};
