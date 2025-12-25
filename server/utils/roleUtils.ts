import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to check if the user has specific roles.
 * @param allowedRoles List of roles allowed to access the route.
 */
export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
             return res.status(403).json({ error: 'Insufficent permissions' });
        }
        next();
    };
};

// Helper for single role checks, though checkRole is usually enough
export const isAdmin = (role: string) => ['admin', 'head_admin', 'maintainer', 'neroferno', 'killu', 'founder'].includes(role);
