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
