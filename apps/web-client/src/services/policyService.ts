import { supabase } from './supabaseClient';
import { getAuthHeaders } from './adminAuth';

const API_URL = import.meta.env.VITE_API_URL;

export interface Policy {
    id: number;
    slug: string;
    title: string;
    content: string;
    updated_at: string;
}

export const getPolicies = async (): Promise<Policy[]> => {
    const res = await fetch(`${API_URL}/policies`);
    if (!res.ok) throw new Error('Error fetching policies');
    const data = await res.json();
    return data.success ? data.data : data;
};

export const getPolicy = async (slug: string): Promise<Policy> => {
    const res = await fetch(`${API_URL}/policies/${slug}`);
    if (!res.ok) throw new Error('Error fetching policy');
    const data = await res.json();
    return data.success ? data.data : data;
};

export const updatePolicy = async (slug: string, title: string, content: string): Promise<Policy> => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(session?.access_token || null)
    };

    const res = await fetch(`${API_URL}/policies/${slug}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, content })
    });

    if (!res.ok) throw new Error('Error updating policy');
    const data = await res.json();
    return data.success ? data.data : data;
};
