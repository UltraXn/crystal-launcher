import supabase from './supabaseService.js';
export const getAllRules = async () => {
    const { data, error } = await supabase
        .from('server_rules')
        .select('*')
        .order('sort_order', { ascending: true }); // Primary sort
    if (error)
        throw error;
    return data;
};
export const createRule = async (ruleData) => {
    const { data, error } = await supabase
        .from('server_rules')
        .insert([ruleData])
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const updateRule = async (id, updates) => {
    const { data, error } = await supabase
        .from('server_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteRule = async (id) => {
    const { error } = await supabase
        .from('server_rules')
        .delete()
        .eq('id', id);
    if (error)
        throw error;
    return true;
};
