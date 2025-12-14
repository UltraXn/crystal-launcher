const supabase = require('../config/supabaseClient');
const logService = require('../services/logService');

// Obtener todas las configuraciones
const getSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Convertir array [{key: 'theme', value: 'default'}] a objeto { theme: 'default' }
        const settings = {};
        data.forEach(item => {
            settings[item.key] = item.value;
        });

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una configuración
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, username, userId } = req.body; // userId y username para logs

        const { data, error } = await supabase
            .from('site_settings')
            .update({ 
                value, 
                updated_at: new Date(),
                updated_by: userId || null 
            })
            .eq('key', key)
            .select();

        if (error) throw error;

        // Log de auditoría
        await logService.createLog({
            user_id: userId || null,
            username: username || 'Admin',
            action: 'UPDATE_SETTING',
            details: `Changed config '${key}' to '${value}'`,
            source: 'web'
        });

        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSetting
};
