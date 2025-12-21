const supabase = require('../services/supabaseService');

const getNotes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('staff_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createNote = async (req, res) => {
    try {
        const { text, color, rotation } = req.body;
        const { data, error } = await supabase
            .from('staff_notes')
            .insert([{ 
                text, 
                color: color || '#fef3c7', 
                rotation: rotation || 0,
                date: new Date().toLocaleDateString()
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('staff_notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotes,
    createNote,
    deleteNote
};
