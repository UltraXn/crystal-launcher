const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
// const { initDiscordBot } = require('./services/discordService'); // Removed for Cloud Run compatibility

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Discord Bot removed to support serverless deployment
});
