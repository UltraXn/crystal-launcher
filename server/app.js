const express = require('express');
const cors = require('cors');
const systemRoutes = require('./routes/systemRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Necesario para Ko-Fi payload

// Routes
app.use('/api/system', systemRoutes);
app.use('/api/webhooks', webhookRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CrystalTides API' });
});

module.exports = app;
