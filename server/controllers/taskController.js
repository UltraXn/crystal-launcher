const supabase = require('../services/supabaseService');

const getTasks = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('staff_tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, priority, type, assignee, column_id, date } = req.body;
        const { data, error } = await supabase
            .from('staff_tasks')
            .insert([{ 
                title, 
                priority: priority || 'Medium', 
                type: type || 'General', 
                assignee: assignee || 'Unassigned', 
                column_id: column_id || 'idea', 
                date: date || new Date().toLocaleDateString() 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const { data, error } = await supabase
            .from('staff_tasks')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('staff_tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
