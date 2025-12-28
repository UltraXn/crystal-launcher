import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL

export interface ProfileComment {
    id: number;
    content: string;
    created_at: string;
    author_id: string;
    profiles?: {
        username: string;
        avatar_url: string;
        role: string;
    };
}

export const getProfileComments = async (profileId: string): Promise<ProfileComment[]> => {
    const res = await fetch(`${API_URL}/profiles/comments/${profileId}`)
    if (!res.ok) throw new Error('Failed to fetch comments')
    const data = await res.json()
    return data.data || data
}

export const postProfileComment = async (profileId: string, content: string): Promise<ProfileComment> => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`

    const res = await fetch(`${API_URL}/profiles/comments/${profileId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content })
    })
    if (!res.ok) throw new Error('Failed to post comment')
    const data = await res.json()
    return data.data || data
}

export const deleteProfileComment = async (commentId: number): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = {}
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`

    const res = await fetch(`${API_URL}/profiles/comments/${commentId}`, {
        method: 'DELETE',
        headers
    })
    if (!res.ok) throw new Error('Failed to delete comment')
}
