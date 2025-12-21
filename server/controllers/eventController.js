const eventService = require('../services/eventService');
const logService = require('../services/logService');

const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getAllEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const event = await eventService.createEvent(req.body);

        logService.createLog({
            username: 'Admin',
            action: 'CREATE_EVENT',
            details: `Created event: ${event.title}`,
            source: 'web'
        }).catch(console.error);

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_EVENT',
            details: `Updated event: ${event.title}`,
            source: 'web'
        }).catch(console.error);

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        await eventService.deleteEvent(req.params.id);

        logService.createLog({
            username: 'Admin',
            action: 'DELETE_EVENT',
            details: `Deleted event ID: ${req.params.id}`,
            source: 'web'
        }).catch(console.error);

        res.json({ message: "Evento eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registerForEvent = async (req, res) => {
    try {
        const { userId } = req.body; 
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const registration = await eventService.registerUser(req.params.id, userId);

        logService.createLog({
            user_id: userId,
            username: 'User', 
            action: 'EVENT_REGISTER',
            details: `Registered for event ${req.params.id}`,
            source: 'web'
        }).catch(console.error);

        res.json(registration);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const registrationIds = await eventService.getUserRegistrations(userId);
        res.json(registrationIds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await eventService.getRegistrations(req.params.id);
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    getUserRegistrations,
    getEventRegistrations
};
