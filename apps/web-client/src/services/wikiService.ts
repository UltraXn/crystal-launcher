import { supabase } from './supabaseClient'
import { getAuthHeaders } from './adminAuth'

const API_URL = import.meta.env.VITE_API_URL

export interface WikiArticle {
    id: number;
    slug: string;
    title: string;
    content: string;
    category: string;
    description?: string; // Added description field
    author_id: string;
    created_at: string;
    updated_at: string;
}

export const getWikiArticles = async (category?: string): Promise<WikiArticle[]> => {
    const url = new URL(`${API_URL}/wiki`, window.location.origin);
    if (category) url.searchParams.append('category', category);
    
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Failed to fetch wiki articles')
    const data = await res.json()
    return data.data || data
}

export const getWikiArticle = async (slug: string): Promise<WikiArticle> => {
    const res = await fetch(`${API_URL}/wiki/${slug}`)
    if (!res.ok) throw new Error('Article not found')
    const data = await res.json()
    return data.data || data
}

export const createWikiArticle = async (articleData: Partial<WikiArticle>): Promise<WikiArticle> => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(session?.access_token || null)
    }

    const res = await fetch(`${API_URL}/wiki`, {
        method: 'POST',
        headers,
        body: JSON.stringify(articleData)
    })
    if (!res.ok) throw new Error('Failed to create wiki article')
    const data = await res.json()
    return data.data || data
}

export const updateWikiArticle = async (id: number, articleData: Partial<WikiArticle>): Promise<WikiArticle> => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(session?.access_token || null)
    }

    const res = await fetch(`${API_URL}/wiki/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(articleData)
    })
    if (!res.ok) throw new Error('Failed to update wiki article')
    const data = await res.json()
    return data.data || data
}

export const deleteWikiArticle = async (id: number): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = getAuthHeaders(session?.access_token || null)

    const res = await fetch(`${API_URL}/wiki/${id}`, {
        method: 'DELETE',
        headers
    })
    if (!res.ok) throw new Error('Failed to delete wiki article')
}
