require('dotenv').config();

const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');
const { performanceMonitorMiddleware } = require('./src/utils/performanceMonitor');
const logger = require('./src/utils/logger');

console.log('--- LOGGER DEBUG CHECK ---');
console.log('Logger keys:', Object.keys(logger));
console.log('Has debug:', typeof logger.debug);
console.log('--------------------------');

const analyzeRoute = require('./src/routes/analyze');
const localizeRoute = require('./src/routes/localize');
const ttsRoute = require('./src/routes/tts');
const mealRoute = require('./src/routes/meal');
const alternativesRoute = require('./src/routes/alternatives');
const chatRoute = require('./src/routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// 🚀 Performance monitoring middleware
app.use(performanceMonitorMiddleware());

app.use(rateLimiter);

// --- Routes ---
app.use('/api/analyze', analyzeRoute);
app.use('/api/localize', localizeRoute);
app.use('/api/tts', ttsRoute);
app.use('/api/meal', mealRoute);
app.use('/api/alternatives', alternativesRoute);
app.use('/api/chat', chatRoute);

// --- Health Check with Performance Metrics ---
app.get('/api/health', (req, res) => {
  const { performanceMonitor } = require('./src/utils/performanceMonitor');
  res.json({
    status: 'ok',
    service: 'nutralingo-backend',
    health: performanceMonitor.getHealthCheck()
  });
});

// --- Performance Dashboard Endpoint (for monitoring) ---
app.get('/api/metrics', (req, res) => {
  const { performanceMonitor } = require('./src/utils/performanceMonitor');
  const { llmCache } = require('./src/utils/llmResponseCache');
  const { globalCache } = require('./src/utils/cacheManager');

  res.json({
    performance: performanceMonitor.getPerformanceDashboard(),
    llmCache: llmCache.getStats(),
    responseCache: globalCache.getStats(),
    timestamp: new Date().toISOString()
  });
});

// --- Error Handler (must be last) ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 NutraLingo backend running on port ${PORT}`);
});

module.exports = app;
