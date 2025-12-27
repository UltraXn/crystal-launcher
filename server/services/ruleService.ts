import supabase from './supabaseService.js';

export interface Rule {
    id: number;
    category: string;
    title: string;
    content: string;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export const getAllRules = async () => {
    const { data, error } = await supabase
        .from('server_rules')
        .select('*')
        .order('sort_order', { ascending: true }); // Primary sort
    
    if (error) throw error;
    return data as Rule[];
};

export const createRule = async (ruleData: Omit<Rule, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('server_rules')
        .insert([ruleData])
        .select()
        .single();
    
    if (error) throw error;
    return data as Rule;
};

export const updateRule = async (id: number, updates: Partial<Rule>) => {
    const { data, error } = await supabase
        .from('server_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return data as Rule;
};

export const deleteRule = async (id: number) => {
    const { error } = await supabase
        .from('server_rules')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
};
