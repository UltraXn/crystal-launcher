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

const updateUserMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const { metadata } = req.body;
        
        if (!metadata) return res.status(400).json({ error: 'Metadata object is required' });

        const updatedUser = await userService.updateUserMetadata(id, metadata);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_METADATA',
            details: `Updated user ${id} metadata: ${JSON.stringify(metadata)}`,
            source: 'web'
        }).catch(console.error);

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const profile = await userService.getPublicProfile(username);
        if (!profile) return res.status(404).json({ error: 'User not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    updateUserMetadata,
    getPublicProfile
};
