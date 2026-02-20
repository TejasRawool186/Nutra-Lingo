const logger = require('./logger');

/**
 * Performance Monitoring Utility.
 * Tracks API response times, memory usage, LLM call metrics, etc.
 * Can be connected to external monitoring (Datadog, New Relic, etc.)
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.requestMetrics = [];
        this.maxRequestHistory = 1000;
        this.startTime = Date.now();
    }

    /**
     * Start timing a named operation.
     *
     * @param {string} operationName - Name of operation (e.g., 'gemini-extract')
     * @returns {function} Call this to end timing
     */
    startTimer(operationName) {
        const startTime = Date.now();
        let ended = false;

        return (metadata = {}) => {
            if (ended) return;
            ended = true;

            const duration = Date.now() - startTime;
            this._recordMetric(operationName, duration, metadata);
            return duration;
        };
    }

    /**
     * Record an API call metric.
     *
     * @param {object} data - { endpoint, method, statusCode, duration, size }
     */
    recordApiCall(data) {
        const metric = {
            timestamp: Date.now(),
            ...data
        };

        this.requestMetrics.push(metric);

        // Keep last 1000 requests
        if (this.requestMetrics.length > this.maxRequestHistory) {
            this.requestMetrics.shift();
        }

        this._recordMetric(`api:${data.endpoint}`, data.duration, {
            status: data.statusCode,
            size: data.size
        });
    }

    /**
     * Record LLM API call metrics.
     *
     * @param {object} data - { model, totalTokens, duration, cacheHit }
     */
    recordLlmCall(data) {
        const metric = {
            type: 'llm',
            timestamp: Date.now(),
            ...data
        };

        this._recordMetric(`llm:${data.model}`, data.duration, {
            tokens: data.totalTokens,
            cacheHit: data.cacheHit
        });

        logger.debug('LLM call recorded', {
            model: data.model,
            duration: `${data.duration}ms`,
            tokens: data.totalTokens,
            cached: data.cacheHit
        });
    }

    /**
     * Get performance summary for specific operation.
     *
     * @param {string} operationName - Name of operation
     * @returns {object} Statistics { avg, min, max, count }
     */
    getMetricStats(operationName) {
        if (!this.metrics.has(operationName)) {
            return null;
        }

        const data = this.metrics.get(operationName);
        return {
            operation: operationName,
            count: data.values.length,
            avgMs: (data.total / data.values.length).toFixed(2),
            minMs: Math.min(...data.values),
            maxMs: Math.max(...data.values),
            p95: data.values.sort((a, b) => a - b)[Math.floor(data.values.length * 0.95)],
            p99: data.values.sort((a, b) => a - b)[Math.floor(data.values.length * 0.99)],
            failureCount: data.failureCount || 0
        };
    }

    /**
     * Get comprehensive performance dashboard.
     *
     * @returns {object} All metrics summary
     */
    getPerformanceDashboard() {
        const dashboard = {
            uptime: `${((Date.now() - this.startTime) / 1000 / 60).toFixed(1)} minutes`,
            totalRequests: this.requestMetrics.length,
            operations: {}
        };

        for (const [opName] of this.metrics) {
            dashboard.operations[opName] = this.getMetricStats(opName);
        }

        // Calculate average response time
        if (this.requestMetrics.length > 0) {
            const avgResponse = (
                this.requestMetrics.reduce((sum, m) => sum + m.duration, 0) /
                this.requestMetrics.length
            ).toFixed(2);
            dashboard.avgResponseTimeMs = avgResponse;

            // Group by status code
            const byStatus = {};
            this.requestMetrics.forEach(m => {
                byStatus[m.statusCode] = (byStatus[m.statusCode] || 0) + 1;
            });
            dashboard.responsesByStatus = byStatus;
        }

        // Memory usage
        dashboard.memoryUsage = this._getMemoryUsage();

        return dashboard;
    }

    /**
     * Get recent API calls.
     *
     * @param {number} limit - Number of recent calls to return (default 50)
     * @returns {object[]} Recent requests
     */
    getRecentRequests(limit = 50) {
        return this.requestMetrics.slice(-limit);
    }

    /**
     * Identify performance bottlenecks.
     * Returns slowest operations.
     *
     * @returns {object[]} Sorted by average duration
     */
    getBottlenecks(limit = 10) {
        const stats = [];

        for (const [opName] of this.metrics) {
            stats.push(this.getMetricStats(opName));
        }

        return stats
            .sort((a, b) => parseFloat(b.avgMs) - parseFloat(a.avgMs))
            .slice(0, limit);
    }

    /**
     * Health check summary.
     * Returns operational metrics for monitoring.
     *
     * @returns {object}
     */
    getHealthCheck() {
        const dashboard = this.getPerformanceDashboard();
        const bottlenecks = this.getBottlenecks();

        return {
            status: 'healthy',
            uptime: dashboard.uptime,
            requests: dashboard.totalRequests,
            avgResponseMs: dashboard.avgResponseTimeMs,
            responsesByStatus: dashboard.responsesByStatus,
            slowestOperations: bottlenecks.slice(0, 3),
            memory: dashboard.memoryUsage,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reset all metrics (for testing or periodic reset).
     */
    reset() {
        this.metrics.clear();
        this.requestMetrics = [];
        this.startTime = Date.now();
        logger.info('Performance metrics reset');
    }

    // ─── Private helpers ───

    /**
     * Record individual metric data point.
     *
     * @private
     */
    _recordMetric(opName, duration, metadata) {
        if (!this.metrics.has(opName)) {
            this.metrics.set(opName, { values: [], total: 0, failureCount: 0 });
        }

        const metric = this.metrics.get(opName);
        metric.values.push(duration);
        metric.total += duration;

        if (metadata?.error) {
            metric.failureCount++;
        }

        // Keep sliding window of 1000 measurements per operation
        if (metric.values.length > 1000) {
            const removed = metric.values.shift();
            metric.total -= removed;
        }
    }

    /**
     * Get memory usage.
     *
     * @private
     * @returns {object}
     */
    _getMemoryUsage() {
        const heapUsed = process.memoryUsage().heapUsed;
        return {
            heapUsedMB: (heapUsed / 1024 / 1024).toFixed(2),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Global performance monitor instance.
 */
const performanceMonitor = new PerformanceMonitor();

/**
 * Express middleware to auto-record API metrics.
 *
 * @returns {function} Express middleware
 */
function performanceMonitorMiddleware() {
    return (req, res, next) => {
        const startTime = Date.now();
        const originalSend = res.send.bind(res);

        res.send = function(data) {
            const duration = Date.now() - startTime;
            const size = Buffer.byteLength(data);

            performanceMonitor.recordApiCall({
                endpoint: req.path,
                method: req.method,
                statusCode: res.statusCode,
                duration,
                size
            });

            return originalSend(data);
        };

        next();
    };
}

module.exports = {
    PerformanceMonitor,
    performanceMonitor,
    performanceMonitorMiddleware
};
