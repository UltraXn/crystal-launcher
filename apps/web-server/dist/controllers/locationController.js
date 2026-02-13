import * as locationService from '../services/locationService.js';
import * as logService from '../services/logService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return String(error);
};
export const getLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();
        return sendSuccess(res, locations);
    }
    catch (error) {
        console.error("Error in getLocations:", error);
        const message = getErrorMessage(error);
        if (message.includes('relation "public.world_locations" does not exist')) {
            return sendSuccess(res, [], 'Locations table not created yet');
        }
        return sendError(res, message, 'FETCH_ERROR', 500, error);
    }
};
export const createLocation = async (req, res) => {
    try {
        const { title, description, long_description, coords, image_url, is_coming_soon, authors, sort_order } = req.body;
        if (!title || !description || !long_description) {
            return sendError(res, 'Missing required fields: title, description, long_description', 'MISSING_FIELDS', 400);
        }
        const newLocation = await locationService.createLocation({
            title,
            description,
            long_description,
            coords: coords || '???',
            image_url: image_url || null,
            is_coming_soon: is_coming_soon || false,
            authors: authors || [],
            sort_order: sort_order || 0
        });
        // Audit Log
        const editor = req.user;
        logService.createLog({
            user_id: editor?.id || undefined,
            username: editor?.username || 'Admin',
            action: 'CREATE_LOCATION',
            details: `Created location: ${title}`,
            source: 'web'
        }).catch(console.error);
        return sendSuccess(res, newLocation, 'Location created successfully');
    }
    catch (error) {
        console.error("Error in createLocation:", error);
        const message = getErrorMessage(error);
        return sendError(res, message, 'CREATE_ERROR', 500, error);
    }
};
export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedLocation = await locationService.updateLocation(parseInt(id), updates);
        // Audit Log
        const editor = req.user;
        logService.createLog({
            user_id: editor?.id || undefined,
            username: editor?.username || 'Admin',
            action: 'UPDATE_LOCATION',
            details: `Updated location #${id}: ${updatedLocation.title}`,
            source: 'web'
        }).catch(console.error);
        return sendSuccess(res, updatedLocation, 'Location updated successfully');
    }
    catch (error) {
        console.error("Error in updateLocation:", error);
        const message = getErrorMessage(error);
        return sendError(res, message, 'UPDATE_ERROR', 500, error);
    }
};
export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        await locationService.deleteLocation(parseInt(id));
        // Audit Log
        const editor = req.user;
        logService.createLog({
            user_id: editor?.id || undefined,
            username: editor?.username || 'Admin',
            action: 'DELETE_LOCATION',
            details: `Deleted location #${id}`,
            source: 'web'
        }).catch(console.error);
        return sendSuccess(res, null, 'Location deleted successfully');
    }
    catch (error) {
        console.error("Error in deleteLocation:", error);
        const message = getErrorMessage(error);
        return sendError(res, message, 'DELETE_ERROR', 500, error);
    }
};
