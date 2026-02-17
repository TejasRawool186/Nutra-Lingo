const rateLimit = require('express-rate-limit');

/**
 * Basic rate limiter — 30 requests per minute per IP.
 * Prevents abuse of OpenAI/Lingo.dev API calls.
 */
const rateLimiter = rateLimit({
    windowMs: 60 * 1000,          // 1 minute window
    max: 30,                      // 30 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment.'
    }
});

module.exports = rateLimiter;
