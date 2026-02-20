/**
 * Simple structured logger.
 * Outputs JSON logs with timestamp and level.
 */
const logger = {
    info: (message, data = {}) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    warn: (message, data = {}) => {
        console.warn(JSON.stringify({
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    debug: (message, data = {}) => {
        // Use console.debug when available; fall back to console.log
        const output = JSON.stringify({
            level: 'DEBUG',
            timestamp: new Date().toISOString(),
            message,
            ...data
        });
        if (typeof console.debug === 'function') {
            console.debug(output);
        } else {
            console.log(output);
        }
    },

    error: (message, data = {}) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    }
};

// Ensure debug matches properties if somehow stripped (defensive coding)
if (typeof logger.debug !== 'function') {
    logger.debug = (message, data) => console.log('DEBUG (fallback):', message, data);
}

module.exports = logger;
