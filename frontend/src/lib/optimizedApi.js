/**
 * Frontend API wrapper with caching, retry logic, and performance tracking.
 * Optimizes API calls by caching responses and implementing smart retry strategies.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Simple in-memory cache for API responses
class ApiCache {
    constructor(ttlSeconds = 3600) {
        this.cache = new Map();
        this.ttlSeconds = ttlSeconds;
    }

    generateKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    set(key, value, ttl = this.ttlSeconds) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl * 1000
        });
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    clear() {
        this.cache.clear();
    }
}

const apiCache = new ApiCache(3600);  // 1 hour TTL

/**
 * Retry with exponential backoff.
 *
 * @param {function} fn - Async function to retry
 * @param {number} maxRetries - Max retry attempts
 * @param {number} initialDelayMs - Initial delay in milliseconds
 * @returns {Promise} Result of fn
 */
export async function withRetry(fn, maxRetries = 3, initialDelayMs = 500) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Exponential backoff: 500ms, 1s, 2s
            if (i < maxRetries - 1) {
                const delayMs = initialDelayMs * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError;
}

/**
 * Track API performance (for analytics).
 *
 * @param {string} endpoint - API endpoint
 * @param {number} duration - Request duration in ms
 * @param {number} status - HTTP status code
 */
function trackApiPerformance(endpoint, duration, status) {
    // Send to analytics service (e.g., GA, Mixpanel)
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'api_call', {
            endpoint,
            duration,
            status
        });
    }

    console.debug(`API: ${endpoint} - ${duration}ms (${status})`);
}

/**
 * POST /api/analyze — Send image + profile for analysis.
 * ✅ Retry logic enabled (transient network failures)
 * ✅ Performance tracking
 */
export async function analyzeImage(base64Image, profile) {
    return withRetry(async () => {
        const startTime = Date.now();

        const res = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, profile })
        });

        const duration = Date.now() - startTime;
        trackApiPerformance('/api/analyze', duration, res.status);

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Analysis failed' }));
            const err = new Error(error.message || `Analysis failed (${res.status})`);
            err.status = res.status;
            throw err;
        }

        return res.json();
    });
}

/**
 * POST /api/localize — Localize health report.
 * ✅ Caching enabled (similar requests return cached results)
 * ✅ Retry logic
 */
export async function localizeReport(healthReport, targetLanguage, profile, ingredients, additives) {
    // Check cache first
    const cacheKey = apiCache.generateKey('/api/localize', {
        healthReportScore: healthReport.score,
        verdict: healthReport.verdict,
        targetLanguage
    });

    const cached = apiCache.get(cacheKey);
    if (cached) {
        console.debug('Using cached localization');
        return cached;
    }

    return withRetry(async () => {
        const startTime = Date.now();

        const isMeal = ingredients === 'meal';

        const body = {
            targetLanguage,
            profile,
            type: isMeal ? 'meal' : 'health',
            healthReport: isMeal ? undefined : healthReport,
            mealReport: isMeal ? healthReport : undefined,
            ingredients: isMeal ? undefined : ingredients,
            additives: isMeal ? undefined : additives
        };

        const res = await fetch(`${API_BASE}/api/localize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const duration = Date.now() - startTime;
        trackApiPerformance('/api/localize', duration, res.status);

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Localization failed' }));
            const err = new Error(error.message || `Localization failed (${res.status})`);
            err.status = res.status;
            throw err;
        }

        const data = await res.json();

        // Cache successful responses
        apiCache.set(cacheKey, data, 86400);  // 24 hours

        return data;
    });
}

/**
 * POST /api/meal — Send dish photo for Gemini meal analysis.
 * ✅ Performance tracking
 */
export async function analyzeMeal(base64Image) {
    return withRetry(async () => {
        const startTime = Date.now();

        const res = await fetch(`${API_BASE}/api/meal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const duration = Date.now() - startTime;
        trackApiPerformance('/api/meal', duration, res.status);

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Meal analysis failed' }));
            const err = new Error(error.message || `Meal analysis failed (${res.status})`);
            err.status = res.status;
            throw err;
        }

        return res.json();
    });
}

/**
 * POST /api/alternatives — Get healthier alternatives for a scanned product.
 * ✅ Caching enabled (same products return cached alternatives)
 */
export async function getAlternatives(extraction) {
    // Check cache
    const cacheKey = apiCache.generateKey('/api/alternatives', {
        ingredients: extraction.ingredients?.slice(0, 3),
        calories: Math.round(extraction.nutrition?.calories / 50) * 50
    });

    const cached = apiCache.get(cacheKey);
    if (cached) {
        console.debug('Using cached alternatives');
        return cached;
    }

    return withRetry(async () => {
        const startTime = Date.now();

        const res = await fetch(`${API_BASE}/api/alternatives`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ extraction })
        });

        const duration = Date.now() - startTime;
        trackApiPerformance('/api/alternatives', duration, res.status);

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Failed to get alternatives' }));
            const err = new Error(error.message || `Request failed (${res.status})`);
            err.status = res.status;
            throw err;
        }

        const data = await res.json();
        apiCache.set(cacheKey, data, 604800);  // 7 days

        return data;
    });
}

/**
 * POST /api/tts — Convert text to speech.
 */
export async function textToSpeech(text, language = 'en') {
    return withRetry(async () => {
        const startTime = Date.now();

        const res = await fetch(`${API_BASE}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language })
        });

        const duration = Date.now() - startTime;
        trackApiPerformance('/api/tts', duration, res.status);

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'TTS failed' }));
            const err = new Error(error.message || `TTS failed (${res.status})`);
            err.status = res.status;
            throw err;
        }

        return res.blob();
    });
}

/**
 * POST /api/chat — Chat with AI assistant.
 */
export async function chatRequest(message, context = {}) {
    return withRetry(async () => {
        const startTime = Date.now();

        const res = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context })
        });

        const duration = Date.now() - startTime;
        trackApiPerformance('/api/chat', duration, res.status);

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Chat request failed' }));
            const err = new Error(error.message || `Chat failed (${res.status})`);
            err.status = res.status;
            throw err;
        }

        return res.json();
    });
}

/**
 * Clear API cache (manual cache invalidation).
 */
export function clearApiCache() {
    apiCache.clear();
    console.log('API cache cleared');
}

export { apiCache };
