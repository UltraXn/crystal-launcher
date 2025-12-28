import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const simulateDonation = async (username: string, amount: number, currency: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_URL}/donations/test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, amount, currency })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al simular donación');
    }

    return await response.json();
};
