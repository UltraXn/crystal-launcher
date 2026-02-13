import supabase from './supabaseService.js';
export const getAllArticles = async (category) => {
    let query = supabase.from('wiki_articles').select('*').order('created_at', { ascending: false });
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error)
        throw error;
    return data;
};
export const getArticleBySlug = async (slug) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error)
        throw error;
    return data;
};
export const createArticle = async (articleData) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .insert([articleData])
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const updateArticle = async (id, articleData) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .update(articleData)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteArticle = async (id) => {
    const { error } = await supabase
        .from('wiki_articles')
        .delete()
        .eq('id', id);
    if (error)
        throw error;
    return true;
};
