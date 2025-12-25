import { Response } from 'express';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
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

export const sendError = (res: Response, message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: any) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            details
        }
    });
};
