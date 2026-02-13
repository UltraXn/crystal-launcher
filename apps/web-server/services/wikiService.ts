import supabase from './supabaseService.js';

export interface WikiArticle {
    id: number;
    slug: string;
    title: string;
    content: string;
    category: string;
    author_id: string;
    created_at: string;
    updated_at: string;
}

export const getAllArticles = async (category?: string) => {
    let query = supabase.from('wiki_articles').select('*').order('created_at', { ascending: false });
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getArticleBySlug = async (slug: string) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) throw error;
    return data;
};

export const createArticle = async (articleData: Partial<WikiArticle>) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .insert([articleData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateArticle = async (id: number, articleData: Partial<WikiArticle>) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .update(articleData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteArticle = async (id: number) => {
    const { error } = await supabase
        .from('wiki_articles')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};
