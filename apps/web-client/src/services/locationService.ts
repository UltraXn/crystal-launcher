const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface LocationAuthor {
    name: string;
    role: string;
}

export interface WorldLocation {
    id: number;
    title: string;
    description: string;
    long_description: string;
    coords: string;
    image_url: string | null;
    is_coming_soon: boolean;
    authors: LocationAuthor[];
    sort_order: number;
}

export const getLocations = async (): Promise<WorldLocation[]> => {
    const response = await fetch(`${API_URL}/locations`);
    if (!response.ok) throw new Error('Failed to fetch locations');
    const json = await response.json();
    return json.success ? json.data : [];
};

export const createLocation = async (location: Omit<WorldLocation, 'id'>, token: string): Promise<WorldLocation> => {
    const response = await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(location)
    });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to create location');
    }
    return json.data;
};

export const updateLocation = async (id: number, updates: Partial<WorldLocation>, token: string): Promise<WorldLocation> => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to update location');
    }
    return json.data;
};

export const deleteLocation = async (id: number, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || json.message || 'Failed to delete location');
    }
};
