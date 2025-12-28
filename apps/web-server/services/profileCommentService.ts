import supabase from './supabaseService.js';

export const getCommentsByProfile = async (profileId: string) => {
    // We join with profiles twice (one for author metadata) 
    // but dynamic select in Supabase might be tricky with same table join
    // We use public.profiles for names
    const { data, error } = await supabase
        .from('profile_comments')
        .select(`
            id,
            content,
            created_at,
            author_id,
            profiles:author_id (
                username,
                avatar_url,
                role
            )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createComment = async (profileId: string, authorId: string, content: string) => {
    const { data, error } = await supabase
        .from('profile_comments')
        .insert([{
            profile_id: profileId,
            author_id: authorId,
            content: content
        }])
        .select(`
            id,
            content,
            created_at,
            author_id,
            profiles:author_id (
                username,
                avatar_url,
                role
            )
        `)
        .single();

    if (error) throw error;
    return data;
};

export const deleteComment = async (commentId: number) => {
    const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId);

    if (error) throw error;
    return true;
};
