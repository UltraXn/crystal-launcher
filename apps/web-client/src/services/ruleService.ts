const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Rule {
    id: number;
    category: string;
    title: string;
    title_en?: string;
    content: string;
    content_en?: string;
    color?: string;
    sort_order: number;
}

export const getRules = async (): Promise<Rule[]> => {
    const response = await fetch(`${API_URL}/rules`);
    if (!response.ok) throw new Error('Failed to fetch rules');
    const json = await response.json();
    return json.success ? json.data : [];
};

export const createRule = async (rule: Omit<Rule, 'id'>, token: string): Promise<Rule> => {
    const response = await fetch(`${API_URL}/rules`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rule)
    });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to create rule');
    }
    return json.data;
};

export const updateRule = async (id: number, updates: Partial<Rule>, token: string): Promise<Rule> => {
    const response = await fetch(`${API_URL}/rules/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to update rule');
    }
    return json.data;
};

export const deleteRule = async (id: number, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/rules/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || json.message || 'Failed to delete rule');
    }
};
