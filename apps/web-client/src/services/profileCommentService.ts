import { supabase } from './supabaseClient'



export interface ProfileComment {
    id: number;
    content: string;
    created_at: string;
    author_id: string;
    author?: {
        username: string;
        avatar_url: string;
        role: string;
    };
}

export const getProfileComments = async (profileId: string): Promise<ProfileComment[]> => {
    const { data, error } = await supabase
        .from('profile_comments')
        .select(`
            *,
            author:author_id (
                username,
                avatar_url,
                role
            )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export const postProfileComment = async (profileId: string, content: string): Promise<ProfileComment> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data, error } = await supabase
        .from('profile_comments')
        .insert({
            profile_id: profileId,
            author_id: session.user.id,
            content
        })
        .select(`
            *,
            author:author_id (
                username,
                avatar_url,
                role
            )
        `)
        .single()

    if (error) throw error
    return data
}

export const deleteProfileComment = async (commentId: number): Promise<void> => {
    const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId)

    if (error) throw error
}
