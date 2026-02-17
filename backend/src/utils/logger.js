/**
 * Simple structured logger.
 * Outputs JSON logs with timestamp and level.
 */
const logger = {
    info(message, data = {}) {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    warn(message, data = {}) {
        console.warn(JSON.stringify({
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    error(message, data = {}) {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    }
};

module.exports = logger;
