const API_URL = import.meta.env.VITE_API_URL;

export const setup2FA = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const enable2FA = async (authToken: string, totpToken: string, secret: string) => {
     const res = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}` 
        },
        body: JSON.stringify({ token: totpToken, secret })
    });
    return res.json();
};

export const disable2FA = async (authToken: string) => {
     const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
    });
    return res.json();
};

export const verify2FA = async (authToken: string, totpToken: string) => {
     const res = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}` 
        },
        body: JSON.stringify({ token: totpToken })
    });
    return res.json();
};

export const get2FAStatus = async (authToken: string) => {
    const res = await fetch(`${API_URL}/auth/2fa/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    return res.json();
};
