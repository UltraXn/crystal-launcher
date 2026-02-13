// Centralized role definitions based on project requirements
export const ADMIN_ROLES = ['admin', 'neroferno', 'killu', 'killuwu', 'developer', 'staff'];
export const STAFF_ROLES = [...ADMIN_ROLES, 'moderator', 'mod', 'helper'];
/**
 * Middleware to check if the user has specific roles.
 * @param allowedRoles List of roles allowed to access the route.
 */
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role.toLowerCase())) {
            return res.status(403).json({ error: 'Insufficent permissions' });
        }
        next();
    };
};
/**
 * Helper for single role checks
 */
export const isAdmin = (role) => ADMIN_ROLES.includes(role);
export const ROLE_PRIORITY = {
    'neroferno': 100,
    'killu': 100,
    'killuwu': 100,
    'developer': 90,
    'admin': 80,
    'moderator': 50,
    'mod': 50,
    'staff': 40,
    'helper': 30,
    'founder': 10,
    'donor': 10,
    'user': 0
};
export const getRolePriority = (role) => {
    if (!role)
        return 0;
    return ROLE_PRIORITY[role.toLowerCase()] || 0;
};
