import supabase from './supabaseService.js';
import { translateText } from './translationService.js';

interface SuggestionData {
    nickname: string;
    type: string;
    message: string;
    user_id?: string;
}



export const createSuggestion = async (data: SuggestionData) => {
    // data: { nickname, type, message, user_id (opt) }
    const { data: result, error } = await supabase
        .from('suggestions')
        .insert([{
            nickname: data.nickname || 'Anónimo',
            type: data.type || 'General',
            message: data.message,
            message_en: await translateText(data.message, 'en'),
            user_id: data.user_id || null,
            status: 'pending'
        }])
        .select()
        .single();

    if (error) throw error;
    return result;
};

export const getSuggestions = async () => {
    const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const deleteSuggestion = async (id: number) => {
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
};
