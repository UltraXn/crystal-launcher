import supabase from './supabaseService.js';
export const getAllLocations = async () => {
    const { data, error } = await supabase
        .from('world_locations')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error)
        throw error;
    return data;
};
export const createLocation = async (locationData) => {
    const { data, error } = await supabase
        .from('world_locations')
        .insert([locationData])
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const updateLocation = async (id, updates) => {
    const { data, error } = await supabase
        .from('world_locations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteLocation = async (id) => {
    const { error } = await supabase
        .from('world_locations')
        .delete()
        .eq('id', id);
    if (error)
        throw error;
    return true;
};
