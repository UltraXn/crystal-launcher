import { listEvents, createEvent } from '../services/googleCalendarService.js';
export const getCalendarEvents = async (req, res) => {
    try {
        const events = await listEvents(20); // Get next 20 events
        res.json(events);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
};
export const syncTaskToCalendar = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        if (!title || !date) {
            return res.status(400).json({ error: 'Title and Date are required' });
        }
        const event = await createEvent({
            summary: `[Kanban] ${title}`,
            description: description || 'Synced from CrystalTides Kanban',
            start: date // Expecting ISO string or understood date format
        });
        res.json({ success: true, event });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to sync task to calendar' });
    }
};
export const getCalendarSubscribeLink = async (req, res) => {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
        return res.status(500).json({ error: 'Calendar ID not configured' });
    }
    // Standard Google Calendar subscribe URL
    const subscribeUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`;
    res.json({ url: subscribeUrl });
};
