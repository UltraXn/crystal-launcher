const userService = require('../services/userService');
const logService = require('../services/logService');

const getAllUsers = async (req, res) => {
    try {
        const { email } = req.query;
        const users = await userService.getAllUsers(email);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role) return res.status(400).json({ error: 'Role is required' });

        const updatedUser = await userService.updateUserRole(id, role);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_ROLE',
            details: `Updated user ${id} role to ${role}`,
            source: 'web'
        }).catch(console.error);

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole
};
