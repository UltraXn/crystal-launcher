const app = require('./app');
const dotenv = require('dotenv');
const { initDiscordBot } = require('./services/discordService');

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Iniciar Bot de Discord (si hay token)
    initDiscordBot();
});
