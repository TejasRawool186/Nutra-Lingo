const logger = require('../utils/logger');

/**
 * Global error handler middleware.
 * Catches all unhandled errors, logs them, and returns a clean JSON response.
 */
function errorHandler(err, req, res, next) {
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const response = {
        error: err.code || 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong. Please try again.'
            : err.message
    };

    res.status(statusCode).json(response);
}

module.exports = errorHandler;
