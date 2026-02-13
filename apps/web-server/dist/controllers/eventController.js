import * as eventService from '../services/eventService.js';
import * as logService from '../services/logService.js';
export const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getAllEvents();
        res.json(events);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const createEvent = async (req, res) => {
    try {
        console.log("Creating event - Body received:", JSON.stringify(req.body));
        const event = await eventService.createEvent(req.body);
        logService.createLog({
            username: 'Admin',
            action: 'CREATE_EVENT',
            details: `Created event: ${event.title}`,
            source: 'web'
        }).catch(console.error);
        res.json(event);
    }
    catch (error) {
        console.error("Error creating event:", error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const updateEvent = async (req, res) => {
    try {
        const event = await eventService.updateEvent(parseInt(req.params.id), req.body);
        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_EVENT',
            details: `Updated event: ${event.title}`,
            source: 'web'
        }).catch(console.error);
        res.json(event);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const deleteEvent = async (req, res) => {
    try {
        await eventService.deleteEvent(parseInt(req.params.id));
        logService.createLog({
            username: 'Admin',
            action: 'DELETE_EVENT',
            details: `Deleted event ID: ${req.params.id}`,
            source: 'web'
        }).catch(console.error);
        res.json({ message: "Evento eliminado" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const registerForEvent = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId)
            return res.status(400).json({ error: "User ID required" });
        const registration = await eventService.registerUser(parseInt(req.params.id), userId);
        logService.createLog({
            user_id: userId,
            username: 'User',
            action: 'EVENT_REGISTER',
            details: `Registered for event ${req.params.id}`,
            source: 'web'
        }).catch(console.error);
        res.json(registration);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: message });
    }
};
export const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId)
            return res.status(400).json({ error: "User ID required" });
        const registrationIds = await eventService.getUserRegistrations(userId);
        res.json(registrationIds);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
export const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await eventService.getRegistrations(parseInt(req.params.id));
        res.json(registrations);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
