import rateLimit from 'express-rate-limit';
// Global API Limiter (Generous)
// 300 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
// Auth Limiter (Login/Register/Verify) - Stricter
// 10 attempts per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
});
// Sensitive Actions Limiter (Gacha, Tickets, Suggestions)
// 20 requests per hour to prevent spamming database or game server
export const sensitiveActionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'You are performing this action too frequently.' }
});
