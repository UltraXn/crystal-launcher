import supabase from '../config/supabaseClient.js';
export const getAllPolicies = async () => {
    const { data, error } = await supabase
        .from('site_policies')
        .select('*');
    if (error)
        throw error;
    return data;
};
export const getPolicyBySlug = async (slug) => {
    const { data, error } = await supabase
        .from('site_policies')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error)
        throw error;
    return data;
};
export const updatePolicy = async (slug, title, content, title_en, content_en, userId) => {
    const { data, error } = await supabase
        .from('site_policies')
        .update({
        title,
        content,
        title_en,
        content_en,
        last_updated_by: userId,
        updated_at: new Date().toISOString()
    })
        .eq('slug', slug)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
