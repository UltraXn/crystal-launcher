import * as twoFactorService from '../services/twoFactorService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import supabase from '../config/supabaseClient.js';
// Setup - Generate Secret & QR (Protected by AuthenticateToken)
export const setup2FA = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
        const { otpauth_url, base32 } = twoFactorService.generateSecret(user.email || 'user');
        const qrCode = await twoFactorService.generateQRCode(otpauth_url);
        // Return secret (base32) so frontend can use it if QR fails, and current state
        return sendSuccess(res, { secret: base32, qrCode }, '2FA Setup initiated');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Setup failed');
    }
};
// Enable - Verify token & Save Secret (Protected by AuthenticateToken)
export const enable2FA = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
        const { token, secret } = req.body;
        if (!token || !secret)
            return sendError(res, 'Token and Secret required', 'MISSING_FIELDS', 400);
        const verified = twoFactorService.verifyToken(token, secret);
        if (!verified)
            return sendError(res, 'Invalid Token', 'INVALID_TOKEN', 400);
        await twoFactorService.updateUser2FARecord(user.id, secret, true);
        return sendSuccess(res, { enabled: true }, '2FA Enabled Successfully');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Enable failed');
    }
};
// Disable (Protected by AuthenticateToken)
export const disable2FA = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
        await twoFactorService.updateUser2FARecord(user.id, null, false);
        return sendSuccess(res, { enabled: false }, '2FA Disabled');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Disable failed');
    }
};
// Verify - For Admin Access (Protected by AuthenticateToken)
export const verify2FA = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
        const { token } = req.body; // TOTP code
        if (!token)
            return sendError(res, 'Token required', 'MISSING_TOKEN', 400);
        // Fetch user's stored secret from Supabase Admin (app_metadata)
        const { data: { user: fullUser }, error } = await supabase.auth.admin.getUserById(user.id);
        if (error || !fullUser)
            return sendError(res, 'User fetch failed', 'SERVER_ERROR', 500);
        const secret = fullUser.app_metadata?.two_factor_secret;
        const enabled = fullUser.app_metadata?.two_factor_enabled;
        if (!enabled || !secret) {
            return sendError(res, '2FA is not enabled for this account', '2FA_NOT_ENABLED', 403);
        }
        const verified = twoFactorService.verifyToken(token, secret);
        if (!verified)
            return sendError(res, 'Invalid 2FA Code', 'INVALID_TOKEN', 400);
        // Success -> Generate Admin Token
        const adminToken = twoFactorService.signAdminToken(user.id, user.role);
        return sendSuccess(res, { adminToken }, 'Verified');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Verification failed');
    }
};
// Check Status - Returns if 2FA is enabled
export const get2FAStatus = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
        const { data: { user: fullUser }, error } = await supabase.auth.admin.getUserById(user.id);
        if (error || !fullUser)
            throw error;
        console.log('DEBUG: 2FA Check for user:', user.id);
        console.log('DEBUG: app_metadata:', JSON.stringify(fullUser.app_metadata, null, 2));
        console.log('DEBUG: factors:', JSON.stringify(fullUser.factors, null, 2));
        return sendSuccess(res, {
            enabled: !!fullUser.app_metadata?.two_factor_enabled
        }, 'Status fetched');
    }
    catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Status check failed');
    }
};
