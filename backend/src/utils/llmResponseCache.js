const crypto = require('crypto');
const logger = require('./logger');

/**
 * LLM Response Cache — Specialized for caching AI analysis results.
 * Reduces redundant LLM API calls for similar nutrition profiles.
 *
 * Cache strategy:
 * - Hash input (ingredients + nutrition values) to find similar products
 * - If similarity score > 85%, return cached results
 * - Otherwise, call LLM and cache new result
 */
class LlmResponseCache {
    constructor(maxEntries = 1000, ttlSeconds = 86400) {
        this.cache = new Map();
        this.maxEntries = maxEntries;
        this.ttlSeconds = ttlSeconds;
        this.stats = {
            hits: 0,
            misses: 0,
            similarityMatches: 0
        };
    }

    /**
     * Generate hash from extraction data for cache key.
     * Normalizes ingredient strings to improve matching.
     *
     * @param {object} extraction - { ingredients[], nutrition{} }
     * @returns {string} SHA256 hash
     */
    generateHash(extraction) {
        // Normalize: sort ingredients, round nutrition values
        const normalized = {
            ingredients: (extraction.ingredients || [])
                .map(i => i.toLowerCase().trim())
                .sort(),
            nutrition: {
                calories: Math.round((extraction.nutrition?.calories || 0) / 10) * 10,
                sodium: Math.round((extraction.nutrition?.sodium || 0) / 50) * 50,
                sugar: Math.round((extraction.nutrition?.totalSugars || 0) / 5) * 5,
                fat: Math.round((extraction.nutrition?.totalFat || 0) / 5) * 5,
                protein: Math.round((extraction.nutrition?.protein || 0) / 5) * 5
            }
        };

        return crypto
            .createHash('sha256')
            .update(JSON.stringify(normalized))
            .digest('hex')
            .substring(0, 16);  // Short hash
    }

    /**
     * Similarity score between two normalized profiles.
     * Used for fuzzy matching (85%+ = consider it a hit).
     *
     * @param {object} extraction1 - First extraction
     * @param {object} extraction2 - Second extraction
     * @returns {number} Similarity 0-1
     */
    calculateSimilarity(extraction1, extraction2) {
        let score = 0;
        let checks = 0;

        // 1. Ingredient overlap (40% weight)
        const ing1 = new Set(
            (extraction1.ingredients || []).map(i => i.toLowerCase().trim())
        );
        const ing2 = new Set(
            (extraction2.ingredients || []).map(i => i.toLowerCase().trim())
        );
        const overlap = Array.from(ing1).filter(i => ing2.has(i)).length;
        const avgLen = (ing1.size + ing2.size) / 2;
        if (avgLen > 0) {
            score += (overlap / avgLen) * 0.4;
        }
        checks += 0.4;

        // 2. Nutrition value similarity (60% weight)
        const nut1 = extraction1.nutrition || {};
        const nut2 = extraction2.nutrition || {};

        const nutrients = ['calories', 'sodium', 'totalSugars', 'totalFat', 'protein'];
        let nutriScore = 0;
        nutrients.forEach(nut => {
            const v1 = parseFloat(nut1[nut]) || 0;
            const v2 = parseFloat(nut2[nut]) || 0;
            const maxVal = Math.max(v1, v2, 1);
            const diff = Math.abs(v1 - v2) / maxVal;
            nutriScore += Math.max(0, 1 - diff);  // Closer = higher score
        });
        nutriScore /= nutrients.length;
        score += nutriScore * 0.6;
        checks += 0.6;

        return score / checks;
    }

    /**
     * Store LLM result in cache.
     *
     * @param {object} extraction - Input extraction
     * @param {object} healthReport - LLM health analysis result
     */
    setHealthAnalysis(extraction, healthReport) {
        if (this.cache.size >= this.maxEntries) {
            // Evict oldest
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const key = this.generateHash(extraction);
        this.cache.set(key, {
            extraction,
            healthReport,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.ttlSeconds * 1000,
            hits: 0
        });

        logger.debug('LLM result cached', { key, size: this.cache.size });
    }

    /**
     * Retrieve cached health analysis with similarity matching.
     * Returns match if similarity >= threshold.
     *
     * @param {object} extraction - Input extraction
     * @param {number} threshold - Similarity threshold 0-1 (default 0.85)
     * @returns {object|null} Cached health report or null
     */
    getHealthAnalysis(extraction, threshold = 0.85) {
        // Clean expired entries
        this._removeExpired();

        let bestMatch = null;
        let bestSimilarity = 0;

        // Search through cache for similar profiles
        for (const [key, entry] of this.cache) {
            const similarity = this.calculateSimilarity(extraction, entry.extraction);

            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = entry;
            }
        }

        if (bestMatch && bestSimilarity >= threshold) {
            bestMatch.hits++;
            this.stats.hits++;
            this.stats.similarityMatches++;

            logger.debug('LLM cache hit', {
                similarity: `${(bestSimilarity * 100).toFixed(1)}%`,
                threshold: `${(threshold * 100)}%`,
                hitRate: this._getHitRate()
            });

            return bestMatch.healthReport;
        }

        this.stats.misses++;
        return null;
    }

    /**
     * Cache meal analysis result.
     *
     * @param {string} imageHash - Hash of meal image
     * @param {object} mealResult - Gemini meal analysis result
     */
    setMealAnalysis(imageHash, mealResult) {
        if (this.cache.size >= this.maxEntries) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const key = `meal:${imageHash}`;
        this.cache.set(key, {
            type: 'meal',
            mealResult,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.ttlSeconds * 1000,
            hits: 0
        });

        logger.debug('Meal result cached', { key });
    }

    /**
     * Retrieve cached meal analysis by image hash.
     *
     * @param {string} imageHash - Hash of meal image
     * @returns {object|null} Cached meal result or null
     */
    getMealAnalysis(imageHash) {
        this._removeExpired();
        const key = `meal:${imageHash}`;
        const entry = this.cache.get(key);

        if (entry && Date.now() <= entry.expiresAt) {
            entry.hits++;
            this.stats.hits++;
            logger.debug('Meal cache hit', { key });
            return entry.mealResult;
        }

        this.stats.misses++;
        return null;
    }

    /**
     * Get cache statistics.
     *
     * @returns {object} Stats
     */
    getStats() {
        return {
            size: this.cache.size,
            maxEntries: this.maxEntries,
            ...this.stats,
            hitRate: this._getHitRate(),
            utilizationPercent: ((this.cache.size / this.maxEntries) * 100).toFixed(1)
        };
    }

    /**
     * Estimate memory usage (rough).
     *
     * @returns {object} Memory stats
     */
    getMemoryUsage() {
        let totalSize = 0;
        for (const entry of this.cache.values()) {
            totalSize += JSON.stringify(entry).length;
        }

        return {
            estimatedBytes: totalSize,
            estimatedMB: (totalSize / (1024 * 1024)).toFixed(2),
            perEntryMB: (totalSize / this.cache.size / (1024 * 1024)).toFixed(3)
        };
    }

    /**
     * Clear entire cache.
     */
    clear() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, similarityMatches: 0 };
        logger.info('LLM response cache cleared');
    }

    // ─── Private helpers ───

    /**
     * Remove expired entries.
     *
     * @private
     */
    _removeExpired() {
        for (const [key, entry] of this.cache) {
            if (Date.now() > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Calculate hit rate percentage.
     *
     * @private
     * @returns {string}
     */
    _getHitRate() {
        const total = this.stats.hits + this.stats.misses;
        return total > 0
            ? `${((this.stats.hits / total) * 100).toFixed(1)}%`
            : '0%';
    }
}

/**
 * Global LLM cache instance.
 * Caches health/meal analysis results to avoid redundant LLM calls.
 */
const llmCache = new LlmResponseCache(1000, 86400);  // 1 day TTL

module.exports = {
    LlmResponseCache,
    llmCache
};
