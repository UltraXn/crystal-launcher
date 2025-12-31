import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

export const linkDiscordAccount = async (code: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_URL}/discord/link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al vincular cuenta');
    }

    return await response.json();
};

const BOT_API_URL = 'http://localhost:3002';

export const sendDiscordLog = async (title: string, message: string, level: 'info' | 'warn' | 'error' | 'success' | 'action' = 'info') => {
    try {
        await fetch(`${BOT_API_URL}/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, message, level })
        });
    } catch (error) {
        console.error('Failed to send log to Discord Bot:', error);
    }
};
