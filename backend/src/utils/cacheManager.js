const crypto = require('crypto');
const logger = require('./logger');

/**
 * In-Memory Cache Manager with TTL support.
 * Can be replaced with Redis for distributed caching.
 * 
 * Production: Replace with Redis/Memcached
 * Development: In-memory is sufficient
 */
class CacheManager {
    constructor(ttlSeconds = 3600, maxSize = 500) {
        this.store = new Map();
        this.ttlSeconds = ttlSeconds;
        this.maxSize = maxSize;  // Max entries
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Generate cache key from input data (hash-based).
     * Ensures consistent keys for similar inputs.
     *
     * @param {string} namespace - Cache namespace (e.g., 'health-analysis')
     * @param {object} params - Parameters to hash
     * @returns {string} SHA256 hash key
     */
    generateKey(namespace, params) {
        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(params))
            .digest('hex');
        return `${namespace}:${hash}`;
    }

    /**
     * Store value in cache with TTL.
     *
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time-to-live in seconds (optional, uses default)
     */
    set(key, value, ttl = this.ttlSeconds) {
        // Evict oldest entry if at capacity
        if (this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            this.store.delete(firstKey);
            logger.debug('Cache eviction triggered', { removedKey: firstKey });
        }

        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttl * 1000,
            createdAt: Date.now(),
            hits: 0
        });

        logger.debug('Cache set', { key, ttl, size: this.store.size });
    }

    /**
     * Retrieve value from cache.
     * Automatically removes expired entries.
     *
     * @param {string} key - Cache key
     * @returns {any} Cached value or null if expired/missing
     */
    get(key) {
        const entry = this.store.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        // Check expiration
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.misses++;
            logger.debug('Cache expired', { key });
            return null;
        }

        // Hit tracking
        entry.hits++;
        this.hits++;

        logger.debug('Cache hit', {
            key: key.substring(0, 20) + '...',
            hits: entry.hits,
            hitRate: `${((this.hits / (this.hits + this.misses)) * 100).toFixed(1)}%`
        });

        return entry.value;
    }

    /**
     * Clear cache entirely.
     */
    clear() {
        this.store.clear();
        this.hits = 0;
        this.misses = 0;
        logger.info('Cache cleared');
    }

    /**
     * Get cache statistics.
     *
     * @returns {object} Stats object
     */
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.store.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) : '0',
            utilizationPercent: ((this.store.size / this.maxSize) * 100).toFixed(1)
        };
    }

    /**
     * Remove single entry by key.
     *
     * @param {string} key - Cache key
     */
    delete(key) {
        this.store.delete(key);
        logger.debug('Cache entry deleted', { key });
    }

    /**
     * Get all keys matching a pattern (for maintenance).
     *
     * @param {string} pattern - Namespace pattern (e.g., 'health-*')
     * @returns {string[]} Matching keys
     */
    getKeysByPattern(pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Array.from(this.store.keys()).filter(k => regex.test(k));
    }
}

/**
 * Global cache instance for the application.
 * Initialized with 1 hour TTL and 500 entry limit.
 */
const globalCache = new CacheManager(3600, 500);

/**
 * Cache middleware for Express routes.
 * Automatically caches GET requests.
 *
 * @param {number} ttl - Time-to-live in seconds
 * @returns {function} Express middleware
 */
function cacheMiddleware(ttl = 3600) {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `route:${req.originalUrl}`;
        const cached = globalCache.get(cacheKey);

        if (cached) {
            res.set('X-Cache-Hit', 'true');
            return res.json(cached);
        }

        // Override res.json to cache responses
        const originalJson = res.json.bind(res);
        res.json = function(data) {
            globalCache.set(cacheKey, data, ttl);
            res.set('X-Cache-Hit', 'false');
            return originalJson(data);
        };

        next();
    };
}

module.exports = {
    CacheManager,
    globalCache,
    cacheMiddleware
};
