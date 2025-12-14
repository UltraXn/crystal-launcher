const supabase = require('../config/supabaseClient');

const getAllEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

const createEvent = async (eventData) => {
    const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

    if (error) throw error;
    return data[0];
};

const updateEvent = async (id, updates) => {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

const deleteEvent = async (id) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

const registerUser = async (eventId, userId) => {
    // Check if already registered
    const { data: existing } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        throw new Error("Ya estás inscrito en este evento");
    }

    const { data, error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userId }])
        .select();

    if (error) throw error;
    return data[0];
};

const getRegistrations = async (eventId) => {
     const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profiles(username, avatar_url)') 
        .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
}

const getUserRegistrations = async (userId) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userId);

    if (error) throw error;
    return data.map(r => r.event_id);
}

module.exports = {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerUser,
    getRegistrations,
    getUserRegistrations
};
