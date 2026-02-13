import util from 'minecraft-server-util';
const options = {
    timeout: 5000,
    enableSRV: true
};
/**
 * Obtiene el estado actual del servidor de Minecraft (Java Edition)
 * @param {string} host - La dirección IP del servidor
 * @param {number} port - El puerto del servidor (default: 25565)
 * @returns {Promise<object>} - Datos del servidor (players, version, favicon, etc.)
 */
export const getServerStatus = async (host, port = 25565) => {
    try {
        const result = await util.status(host, port, options);
        // Limpiamos y formateamos la respuesta para que sea fácil de usar en el frontend
        return {
            online: true,
            version: result.version.name,
            players: {
                online: result.players.online,
                max: result.players.max,
                list: result.players.sample || [] // Lista de nombres (si el server la envía)
            },
            motd: result.motd.clean, // Texto plano sin códigos de color
            motdHtml: result.motd.html, // Texto con colores HTML (útil para la web)
            favicon: result.favicon, // Base64 image
            ping: result.roundTripLatency
        };
    }
    catch (error) {
        // Safe error handling for unknown error type
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error('Error fetching Minecraft server status:', errorMessage);
        // Devolvemos un objeto indicando que está offline, en lugar de crashear
        return {
            online: false,
            error: "Server offline or unreachable"
        };
    }
};
/**
 * Send a command to the Minecraft server via Pterodactyl API
 * @param {string} command - Command to execute (without /)
 */
export const sendCommand = async (command) => {
    try {
        const apiKey = process.env.PTERODACTYL_API_KEY;
        const serverId = process.env.PTERODACTYL_SERVER_ID;
        // Default to holy.gg panel, but allow override
        const host = process.env.PTERODACTYL_HOST || 'https://panel.holy.gg';
        if (!apiKey || !serverId) {
            console.error("Missing Pterodactyl credentials");
            return { success: false, error: "Configuration missing" };
        }
        const response = await fetch(`${host}/api/client/servers/${serverId}/command`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ command })
        });
        if (response.ok) {
            return { success: true };
        }
        else {
            return { success: false, error: "API Error" };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to send command:", error);
        return { success: false, error: errorMessage };
    }
};
