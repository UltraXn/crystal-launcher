const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

let client = null;

const initDiscordBot = () => {
    const TOKEN = process.env.DISCORD_BOT_TOKEN;

    if (!TOKEN) {
        console.log('⚠️ Discord Bot Token no configurado. El bot iniciará en modo inactivo.');
        return;
    }

    // Configurar permisos mínimos necesarios (Intents)
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages
        ]
    });

    client.once('ready', () => {
        console.log(`🤖 Discord Bot conectado como: ${client.user.tag}`);
        client.user.setActivity('Vigilando CrystalTides 🌊');
    });

    client.login(TOKEN).catch(err => {
        console.error('❌ Error al conectar Discord Bot:', err.message);
    });
};

/* 
 * Función para enviar mensajes a un canal específico
 * Útil para: Notificar donaciones, nuevas sugerencias, etc.
 */
const sendDiscordNotification = async (channelId, title, description, color = '#0F969C') => {
    if (!client || !client.isReady()) return;

    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error enviando notificación a Discord:', error);
    }
};

module.exports = {
    initDiscordBot,
    sendDiscordNotification,
    getBotClient: () => client
};
