let adminToken: string | null = sessionStorage.getItem('admin_token');

export const setAdminToken = (token: string) => {
    adminToken = token;
    sessionStorage.setItem('admin_2fa_token', token);
};

export const getAdminToken = () => {
    if (!adminToken) {
        adminToken = sessionStorage.getItem('admin_2fa_token');
    }
    return adminToken;
};

export const clearAdminToken = () => {
    adminToken = null;
    sessionStorage.removeItem('admin_2fa_token');
};

export const getAuthHeaders = (sessionToken: string | null) => {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
    
    // Refresh token from storage just in case
    const currentAdminToken = getAdminToken();
    if (currentAdminToken) headers['x-admin-token'] = currentAdminToken;
    
    return headers;
};
