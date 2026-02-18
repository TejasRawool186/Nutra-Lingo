require('dotenv').config();

const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');

const analyzeRoute = require('./src/routes/analyze');
const localizeRoute = require('./src/routes/localize');
const ttsRoute = require('./src/routes/tts');
const mealRoute = require('./src/routes/meal');
const alternativesRoute = require('./src/routes/alternatives');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// --- Routes ---
app.use('/api/analyze', analyzeRoute);
app.use('/api/localize', localizeRoute);
app.use('/api/tts', ttsRoute);
app.use('/api/meal', mealRoute);
app.use('/api/alternatives', alternativesRoute);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'nutralingo-backend' });
});

// --- Error Handler (must be last) ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 NutraLingo backend running on port ${PORT}`);
});

module.exports = app;
